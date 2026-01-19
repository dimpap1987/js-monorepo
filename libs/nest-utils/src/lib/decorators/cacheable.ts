import { isPromise } from '@js-monorepo/utils/common'
import { REDIS } from '../redis'
import { Logger } from '@nestjs/common'
import { RedisClientType } from 'redis'
import { ConfigService } from '@nestjs/config'

export interface CacheableOptions {
  /**
   * Cache key prefix. Will be combined with namespace and method arguments.
   * Example: 'app-user' results in key like 'namespace:app-user:arg1:arg2'
   */
  keyPrefix: string

  /**
   * Time to live in seconds. Default: 300 (5 minutes)
   */
  ttl?: number

  /**
   * Function to generate cache key from method arguments.
   * If not provided, will use default key generation.
   */
  keyGenerator?: (...args: any[]) => string | Promise<string>

  /**
   * Redis namespace. If not provided, will try to get from ConfigService or class property.
   */
  namespace?: string

  /**
   * Whether to cache null/undefined results. Default: false
   */
  cacheNull?: boolean

  /**
   * Error description for logging. Default: 'cache error'
   */
  errorDescription?: string
}

/**
 * Decorator to cache method results in Redis.
 *
 * Requirements:
 * - Class must inject REDIS token for RedisClientType
 * - Class should have a logger property (Logger instance) or will create one
 * - Class should have configService (ConfigService) or redisNamespace property, or pass namespace in options
 *
 * @example
 * ```ts
 * @Cacheable({ keyPrefix: 'app-user', ttl: 300 })
 * async getAppUser(authUserId: number): Promise<AppUserResponseDto | null> {
 *   // method implementation
 * }
 * ```
 *
 * @example With custom key generator
 * ```ts
 * @Cacheable({
 *   keyPrefix: 'user-profile',
 *   keyGenerator: (userId: number, profileType: string) => `${userId}:${profileType}`
 * })
 * async getUserProfile(userId: number, profileType: string) {
 *   // method implementation
 * }
 * ```
 */
export function Cacheable(options: CacheableOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Get dependencies from the class instance
      const redis: RedisClientType = (this as any).redis || (this as any)[REDIS]
      const logger: Logger = (this as any).logger || new Logger(target.constructor.name)
      const configService: ConfigService | undefined = (this as any).configService

      // Get namespace from options, configService, or class property
      let namespace = options.namespace
      if (!namespace) {
        if (configService) {
          namespace = configService.get<string>('REDIS_NAMESPACE')
        } else if ((this as any).redisNamespace) {
          namespace = (this as any).redisNamespace
        }
      }

      if (!redis) {
        logger.warn(
          `[${target.constructor.name}] - ${propertyKey}() - Redis client not found. Method will execute without caching.`
        )
        return originalMethod.apply(this, args)
      }

      if (!namespace) {
        logger.warn(
          `[${target.constructor.name}] - ${propertyKey}() - Redis namespace not found. Method will execute without caching.`
        )
        return originalMethod.apply(this, args)
      }

      // Generate cache key
      let cacheKey: string
      try {
        if (options.keyGenerator) {
          const keyPart = await options.keyGenerator(...args)
          cacheKey = `${namespace}:${options.keyPrefix}:${keyPart}`
        } else {
          // Default: use arguments joined by ':'
          const keyPart = args.map((arg) => String(arg)).join(':')
          cacheKey = `${namespace}:${options.keyPrefix}:${keyPart}`
        }
      } catch (error: any) {
        logger.error(
          `[${target.constructor.name}] - ${propertyKey}() - Error generating cache key: ${error.message}`,
          error.stack
        )
        // Fallback to method execution
        return originalMethod.apply(this, args)
      }

      // Try to get from cache
      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          const parsed = JSON.parse(cached)
          logger.debug(`[${target.constructor.name}] - ${propertyKey}() - Cache HIT for key: ${cacheKey}`)
          return parsed
        }
        logger.debug(`[${target.constructor.name}] - ${propertyKey}() - Cache MISS for key: ${cacheKey}`)
      } catch (error: any) {
        const errorDesc = options.errorDescription || 'cache read error'
        logger.error(
          `[${target.constructor.name}] - ${propertyKey}() - Error reading cache (${errorDesc}): ${error.message}`,
          error.stack
        )
        // Continue to method execution
      }

      // Cache miss - execute method
      const result = originalMethod.apply(this, args)
      const methodResult = isPromise(result) ? await result : result

      // Cache the result (if not null/undefined or if cacheNull is true)
      if ((methodResult !== null && methodResult !== undefined) || options.cacheNull) {
        try {
          const ttl = options.ttl ?? 300
          await redis.set(cacheKey, JSON.stringify(methodResult), {
            EX: ttl,
          })
          logger.debug(
            `[${target.constructor.name}] - ${propertyKey}() - Cached result for key: ${cacheKey} (TTL: ${ttl}s)`
          )
        } catch (error: any) {
          const errorDesc = options.errorDescription || 'cache write error'
          logger.error(
            `[${target.constructor.name}] - ${propertyKey}() - Error writing cache (${errorDesc}): ${error.message}`,
            error.stack
          )
          // Don't throw - caching failures shouldn't break the request
        }
      }

      return methodResult
    }

    return descriptor
  }
}
