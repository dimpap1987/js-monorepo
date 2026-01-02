import { REDIS } from '../redis'
import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import { RedisClientType } from 'redis'

export const DISTRIBUTED_LOCK_PREFIX = Symbol('DISTRIBUTED_LOCK_PREFIX')

export interface LockOptions {
  /** Lock TTL in seconds. Default: 30 */
  ttlSeconds?: number
  /** Retry acquiring lock if failed. Default: false */
  retry?: boolean
  /** Max retry attempts. Default: 3 */
  maxRetries?: number
  /** Delay between retries in ms. Default: 100 */
  retryDelayMs?: number
}

export interface LockResult {
  acquired: boolean
  lockValue: string | null
}

const DEFAULT_TTL_SECONDS = 30
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_RETRY_DELAY_MS = 100

@Injectable()
export class DistributedLockService {
  private readonly logger = new Logger(DistributedLockService.name)

  constructor(
    @Optional() @Inject(REDIS) private readonly redis?: RedisClientType,
    @Optional() @Inject(DISTRIBUTED_LOCK_PREFIX) private readonly prefix?: string
  ) {}

  /**
   * Attempts to acquire a distributed lock using Redis SET NX.
   * Returns a unique lock value that must be used to release the lock.
   */
  async acquireLock(key: string, options?: LockOptions): Promise<LockResult> {
    if (!this.redis) {
      this.logger.warn('Redis not available, lock acquisition skipped')
      return { acquired: true, lockValue: null }
    }

    const ttl = options?.ttlSeconds ?? DEFAULT_TTL_SECONDS
    const lockValue = this.generateLockValue()
    const lockKey = this.getLockKey(key)

    const maxAttempts = options?.retry ? options.maxRetries ?? DEFAULT_MAX_RETRIES : 1
    const retryDelay = options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.redis.set(lockKey, lockValue, {
          NX: true,
          EX: ttl,
        })

        if (result === 'OK') {
          this.logger.debug(`Lock acquired: ${lockKey} (attempt ${attempt})`)
          return { acquired: true, lockValue }
        }

        if (attempt < maxAttempts) {
          await this.delay(retryDelay)
        }
      } catch (error) {
        this.logger.error(`Error acquiring lock ${lockKey}:`, error)
        if (attempt === maxAttempts) {
          return { acquired: false, lockValue: null }
        }
      }
    }

    this.logger.debug(`Lock not acquired: ${lockKey} (already held)`)
    return { acquired: false, lockValue: null }
  }

  /**
   * Releases a lock only if the lock value matches (prevents releasing someone else's lock).
   * Uses Lua script for atomic check-and-delete.
   */
  async releaseLock(key: string, lockValue: string | null): Promise<boolean> {
    if (!this.redis || !lockValue) {
      return true
    }

    const lockKey = this.getLockKey(key)

    // Lua script for atomic check-and-delete
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `

    try {
      const result = await this.redis.eval(luaScript, {
        keys: [lockKey],
        arguments: [lockValue],
      })

      const released = result === 1
      if (released) {
        this.logger.debug(`Lock released: ${lockKey}`)
      } else {
        this.logger.warn(`Lock release failed (not owner): ${lockKey}`)
      }
      return released
    } catch (error) {
      this.logger.error(`Error releasing lock ${lockKey}:`, error)
      return false
    }
  }

  /**
   * Executes a function while holding a distributed lock.
   * Automatically acquires and releases the lock.
   *
   * @returns The function result, or null if lock could not be acquired
   */
  async withLock<T>(
    key: string,
    fn: () => Promise<T>,
    options?: LockOptions
  ): Promise<{ success: true; result: T } | { success: false; result: null }> {
    const { acquired, lockValue } = await this.acquireLock(key, options)

    if (!acquired) {
      return { success: false, result: null }
    }

    try {
      const result = await fn()
      return { success: true, result }
    } finally {
      await this.releaseLock(key, lockValue)
    }
  }

  /**
   * Checks if a lock is currently held (for debugging/monitoring).
   */
  async isLocked(key: string): Promise<boolean> {
    if (!this.redis) {
      return false
    }

    const lockKey = this.getLockKey(key)
    const value = await this.redis.get(lockKey)
    return value !== null
  }

  /**
   * Extends the TTL of an existing lock (only if caller owns it).
   * Useful for long-running operations that may exceed the initial TTL.
   */
  async extendLock(key: string, lockValue: string | null, ttlSeconds: number): Promise<boolean> {
    if (!this.redis || !lockValue) {
      return false
    }

    const lockKey = this.getLockKey(key)

    // Lua script for atomic check-and-extend
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("expire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `

    try {
      const result = await this.redis.eval(luaScript, {
        keys: [lockKey],
        arguments: [lockValue, ttlSeconds.toString()],
      })

      return result === 1
    } catch (error) {
      this.logger.error(`Error extending lock ${lockKey}:`, error)
      return false
    }
  }

  private getLockKey(key: string): string {
    return this.prefix ? `${this.prefix}${key}` : `lock:${key}`
  }

  private generateLockValue(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
