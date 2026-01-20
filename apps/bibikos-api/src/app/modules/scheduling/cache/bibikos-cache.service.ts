import { REDIS } from '@js-monorepo/nest/redis'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisClientType } from 'redis'
import {
  APP_USER_KEY,
  BOOKING_KEY,
  CLASS_KEY,
  INVITATION_KEY,
  LOCATION_KEY,
  ORGANIZER_KEY,
  PARTICIPANT_KEY,
  SCHEDULE_KEY,
} from './constants'

@Injectable()
export class BibikosCacheService {
  private readonly logger = new Logger(BibikosCacheService.name)
  private readonly namespace: string

  constructor(
    @Inject(REDIS)
    private readonly redis: RedisClientType,
    private readonly configService: ConfigService
  ) {
    this.namespace = this.configService.get<string>('REDIS_NAMESPACE') || 'bibikos'
  }

  /**
   * Generate a cache key with namespace and prefix
   */
  private getKey(prefix: string, ...parts: (string | number)[]): string {
    const keyParts = parts.map((part) => String(part))
    return `${this.namespace}:${prefix}:${keyParts.join(':')}`
  }

  /**
   * Get a cached value by key
   */
  async get<T>(prefix: string, ...keyParts: (string | number)[]): Promise<T | null> {
    try {
      const key = this.getKey(prefix, ...keyParts)
      const cached = await this.redis.get(key)

      if (!cached) {
        this.logger.debug(`Cache MISS: ${key}`)
        return null
      }

      this.logger.debug(`Cache HIT: ${key}`)
      return JSON.parse(cached) as T
    } catch (error: any) {
      this.logger.error(`Error reading cache for ${prefix}: ${error.message}`, error.stack)
      return null
    }
  }

  /**
   * Set a cached value with TTL (default: 5 minutes)
   *
   * @example
   * await cacheService.set(APP_USER_KEY, authUserId, appUser)
   * await cacheService.set(APP_USER_KEY, authUserId, appUser, 600)
   */
  async set<T>(
    prefix: string,
    ...args: [...keyParts: (string | number)[], value: T, ttl: number] | [...keyParts: (string | number)[], value: T]
  ): Promise<void> {
    try {
      // Last argument might be TTL (number) or value (T)
      // If second-to-last is definitely the value, last could be TTL
      const lastArg = args[args.length - 1]
      const secondToLastArg = args.length >= 2 ? args[args.length - 2] : undefined

      let ttl: number | undefined
      let value: T
      let keyParts: (string | number)[]

      // Check if last arg is a number (TTL) and second-to-last is not a number (value)
      if (typeof lastArg === 'number' && secondToLastArg !== undefined && typeof secondToLastArg !== 'number') {
        // Last is TTL, second-to-last is value
        ttl = lastArg
        value = secondToLastArg as T
        keyParts = args.slice(0, -2) as (string | number)[]
      } else {
        // Last is value, no TTL provided
        value = lastArg as T
        keyParts = args.slice(0, -1) as (string | number)[]
        ttl = undefined
      }

      const key = this.getKey(prefix, ...keyParts)
      const serialized = JSON.stringify(value)
      const expiration = ttl ?? 300 // Default 5 minutes

      await this.redis.set(key, serialized, {
        EX: expiration,
      })

      this.logger.debug(`Cached: ${key} (TTL: ${expiration}s)`)
    } catch (error: any) {
      this.logger.error(`Error setting cache for ${prefix}: ${error.message}`, error.stack)
      // Don't throw - caching failures shouldn't break the request
    }
  }

  /**
   * Delete a specific cache entry
   */
  async invalidate(prefix: string, ...keyParts: (string | number)[]): Promise<void> {
    try {
      const key = this.getKey(prefix, ...keyParts)
      await this.redis.del(key)
      this.logger.debug(`Invalidated cache: ${key}`)
    } catch (error: any) {
      this.logger.error(`Error invalidating cache for ${prefix}: ${error.message}`, error.stack)
      // Don't throw - cache invalidation failures shouldn't break the request
    }
  }

  /**
   * Delete multiple cache entries matching a pattern
   * WARNING: Use with caution - can be slow on large Redis instances
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const fullPattern = `${this.namespace}:${pattern}`
      const keys: string[] = []
      let cursor = 0

      // Use SCAN with cursor to avoid blocking Redis
      do {
        const { cursor: newCursor, keys: scannedKeys } = await this.redis.scan(cursor, {
          MATCH: fullPattern,
          COUNT: 100,
        })

        cursor = newCursor
        if (scannedKeys.length > 0) {
          keys.push(...scannedKeys)
        }
      } while (cursor !== 0) // Continue until cursor returns to 0

      if (keys.length > 0) {
        const deletedCount = await this.redis.del(keys)
        this.logger.debug(`Invalidated ${deletedCount} cache entries matching pattern: ${pattern}`)
        return deletedCount
      }

      return 0
    } catch (error: any) {
      this.logger.error(`Error invalidating cache pattern ${pattern}: ${error.message}`, error.stack)
      return 0
    }
  }

  /**
   * Check if a cache entry exists
   */
  async exists(prefix: string, ...keyParts: (string | number)[]): Promise<boolean> {
    try {
      const key = this.getKey(prefix, ...keyParts)
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error: any) {
      this.logger.error(`Error checking cache existence for ${prefix}: ${error.message}`, error.stack)
      return false
    }
  }

  /**
   * Get or set a cached value (cache-aside pattern)
   */
  async getOrSet<T>(
    prefix: string,
    keyParts: (string | number)[],
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(prefix, ...keyParts)
    if (cached !== null) {
      return cached
    }

    // Cache miss - fetch and cache
    const value = await fetchFn()
    await this.set(prefix, ...keyParts, value, ttl)
    return value
  }

  /**
   * Invalidate multiple related cache entries (e.g., all caches for a user)
   */
  async invalidateRelated(prefixes: string[], ...commonKeyParts: (string | number)[]): Promise<void> {
    await Promise.all(prefixes.map((prefix) => this.invalidate(prefix, ...commonKeyParts)))
  }

  // ============================================================================
  // Convenience methods for common cache operations
  // ============================================================================

  /**
   * AppUser cache operations
   */
  async getOrSetAppUser<T>(authUserId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(APP_USER_KEY, [authUserId], fetchFn, ttl)
  }

  async invalidateAppUser(authUserId: number) {
    return this.invalidate(APP_USER_KEY, authUserId)
  }

  /**
   * Organizer cache operations
   */
  async getOrSetOrganizer<T>(organizerId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(ORGANIZER_KEY, [organizerId], fetchFn, ttl)
  }

  async invalidateOrganizer(organizerId: number) {
    return this.invalidate(ORGANIZER_KEY, organizerId)
  }

  async invalidateAllOrganizers() {
    return this.invalidatePattern(`${ORGANIZER_KEY}:*`)
  }

  /**
   * Class cache operations
   */
  async getOrSetClass<T>(classId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(CLASS_KEY, [classId], fetchFn, ttl)
  }

  async invalidateClass(classId: number) {
    return this.invalidate(CLASS_KEY, classId)
  }

  async invalidateAllClasses() {
    return this.invalidatePattern(`${CLASS_KEY}:*`)
  }

  /**
   * Location cache operations
   */
  async getOrSetLocation<T>(locationId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(LOCATION_KEY, [locationId], fetchFn, ttl)
  }

  async invalidateLocation(locationId: number) {
    return this.invalidate(LOCATION_KEY, locationId)
  }

  /**
   * Schedule cache operations
   */
  async getOrSetSchedule<T>(scheduleId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(SCHEDULE_KEY, [scheduleId], fetchFn, ttl)
  }

  async invalidateSchedule(scheduleId: number) {
    return this.invalidate(SCHEDULE_KEY, scheduleId)
  }

  /**
   * Booking cache operations
   */
  async getOrSetBooking<T>(bookingId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(BOOKING_KEY, [bookingId], fetchFn, ttl)
  }

  async invalidateBooking(bookingId: number) {
    return this.invalidate(BOOKING_KEY, bookingId)
  }

  /**
   * Participant cache operations
   */
  async getOrSetParticipant<T>(participantId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(PARTICIPANT_KEY, [participantId], fetchFn, ttl)
  }

  async invalidateParticipant(participantId: number) {
    return this.invalidate(PARTICIPANT_KEY, participantId)
  }

  /**
   * Invitation cache operations
   */
  async getOrSetInvitation<T>(invitationId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(INVITATION_KEY, [invitationId], fetchFn, ttl)
  }

  async invalidateInvitation(invitationId: number) {
    return this.invalidate(INVITATION_KEY, invitationId)
  }
}
