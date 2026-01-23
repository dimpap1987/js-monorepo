import { REDIS } from '@js-monorepo/nest/redis'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cache } from 'cache-manager'
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(REDIS)
    private readonly redis: RedisClientType,
    private readonly configService: ConfigService
  ) {
    this.namespace = this.configService.get<string>('REDIS_NAMESPACE') || 'bibikos'
  }

  /**
   * Generate a cache key with prefix
   * Note: Namespace is handled by CacheModule/Keyv configuration, so we don't add it here
   */
  private getKey(prefix: string, ...parts: (string | number)[]): string {
    const keyParts = parts.map((part) => String(part))
    return `${prefix}:${keyParts.join(':')}`
  }

  async get<T>(prefix: string, ...keyParts: (string | number)[]): Promise<T | undefined> {
    const key = this.getKey(prefix, ...keyParts)
    return this.cacheManager.get<T>(key)
  }

  private async set<T>(prefix: string, key: string | number, value: T, ttl?: number): Promise<T> {
    const cacheKey = this.getKey(prefix, key)
    const expirationMs = (ttl ?? 300) * 1000 // Convert seconds to milliseconds
    return this.cacheManager.set(cacheKey, value, expirationMs)
  }

  /**
   * Delete a specific cache entry
   */
  async invalidate(prefix: string, ...keyParts: (string | number)[]): Promise<boolean> {
    const key = this.getKey(prefix, ...keyParts)
    return this.cacheManager.del(key)
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
    const key = this.getKey(prefix, ...keyParts)
    const value = await this.cacheManager.get(key)
    return value !== null && value !== undefined
  }

  /**
   * Get or set a cached value (cache-aside pattern)
   */
  async getOrSet<T>(prefix: string, key: string | number, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(prefix, key)
    if (cached !== undefined && cached !== null) {
      return cached
    }

    const value = await fetchFn()
    await this.set(prefix, key, value, ttl)
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
    return this.getOrSet<T>(APP_USER_KEY, authUserId, fetchFn, ttl)
  }

  async invalidateUserByAuthId(authUserId: number) {
    this.invalidate(APP_USER_KEY, authUserId)
  }

  /**
   * Organizer cache operations
   */
  async getOrSetOrganizer<T>(organizerId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(ORGANIZER_KEY, organizerId, fetchFn, ttl)
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
    return this.getOrSet<T>(CLASS_KEY, classId, fetchFn, ttl)
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
    return this.getOrSet<T>(LOCATION_KEY, locationId, fetchFn, ttl)
  }

  async invalidateLocation(locationId: number) {
    return this.invalidate(LOCATION_KEY, locationId)
  }

  /**
   * Schedule cache operations
   */
  async getOrSetSchedule<T>(scheduleId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(SCHEDULE_KEY, scheduleId, fetchFn, ttl)
  }

  async invalidateSchedule(scheduleId: number) {
    return this.invalidate(SCHEDULE_KEY, scheduleId)
  }

  /**
   * Booking cache operations
   */
  async getOrSetBooking<T>(bookingId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(BOOKING_KEY, bookingId, fetchFn, ttl)
  }

  async invalidateBooking(bookingId: number) {
    return this.invalidate(BOOKING_KEY, bookingId)
  }

  /**
   * Participant cache operations
   */
  async getOrSetParticipant<T>(participantId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(PARTICIPANT_KEY, participantId, fetchFn, ttl)
  }

  async invalidateParticipant(participantId: number) {
    return this.invalidate(PARTICIPANT_KEY, participantId)
  }

  /**
   * Invitation cache operations
   */
  async getOrSetInvitation<T>(invitationId: number, fetchFn: () => Promise<T>, ttl = 300): Promise<T> {
    return this.getOrSet<T>(INVITATION_KEY, invitationId, fetchFn, ttl)
  }

  async invalidateInvitation(invitationId: number) {
    return this.invalidate(INVITATION_KEY, invitationId)
  }
}
