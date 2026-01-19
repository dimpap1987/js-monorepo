import { REDIS } from '../redis'
import { Logger } from '@nestjs/common'
import { RedisClientType } from 'redis'
import { ConfigService } from '@nestjs/config'

export interface CacheInvalidateOptions {
  /**
   * Cache key prefix. Should match the keyPrefix used in @Cacheable decorator.
   */
  keyPrefix: string

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
   * Whether to invalidate before or after method execution. Default: 'after'
   */
  when?: 'before' | 'after'
}

/**
 * Decorator to invalidate cache entries before or after method execution.
 * Useful for update/delete operations that should clear cached data.
 *
 * @example
 * ```ts
 * @CacheInvalidate({ keyPrefix: 'app-user' })
 * async updateAppUser(authUserId: number, data: UpdateAppUserDto) {
 *   // method implementation
 * }
 * ```
 *
 * @example With custom key generator
 * ```ts
 * @CacheInvalidate({
 *   keyPrefix: 'user-profile',
 *   keyGenerator: (userId: number) => String(userId),
 *   when: 'before' // invalidate before execution
 * })
 * async deleteUserProfile(userId: number) {
 *   // method implementation
 * }
 * ```
 */
export function CacheInvalidate(options: CacheInvalidateOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const invalidateCache = async () => {
        // Get dependencies from the class instance
        const redis: RedisClientType = (this as any).redis || (this as any)[REDIS]
        const logger: Logger = (this as any).logger || new Logger(target.constructor.name)
        const configService: ConfigService | undefined = (this as any).configService

        if (!redis) {
          logger.warn(
            `[${target.constructor.name}] - ${propertyKey}() - Redis client not found. Cannot invalidate cache.`
          )
          return
        }

        // Get namespace from options, configService, or class property
        let namespace = options.namespace
        if (!namespace) {
          if (configService) {
            namespace = configService.get<string>('REDIS_NAMESPACE')
          } else if ((this as any).redisNamespace) {
            namespace = (this as any).redisNamespace
          }
        }

        if (!namespace) {
          logger.warn(
            `[${target.constructor.name}] - ${propertyKey}() - Redis namespace not found. Cannot invalidate cache.`
          )
          return
        }

        // Generate cache key
        let cacheKey: string
        try {
          if (options.keyGenerator) {
            const keyPart = await options.keyGenerator(...args)
            cacheKey = `${namespace}:${options.keyPrefix}:${keyPart}`
          } else {
            // Default: use first argument (typically the ID)
            const keyPart = args.length > 0 ? String(args[0]) : ''
            cacheKey = `${namespace}:${options.keyPrefix}:${keyPart}`
          }
        } catch (error: any) {
          logger.error(
            `[${target.constructor.name}] - ${propertyKey}() - Error generating cache key for invalidation: ${error.message}`,
            error.stack
          )
          return
        }

        // Invalidate cache
        try {
          await redis.del(cacheKey)
          logger.debug(`[${target.constructor.name}] - ${propertyKey}() - Invalidated cache for key: ${cacheKey}`)
        } catch (error: any) {
          logger.error(
            `[${target.constructor.name}] - ${propertyKey}() - Error invalidating cache: ${error.message}`,
            error.stack
          )
          // Don't throw - cache invalidation failures shouldn't break the request
        }
      }

      if (options.when === 'before') {
        await invalidateCache()
      }

      const result = originalMethod.apply(this, args)
      const methodResult = await result

      if (options.when !== 'before') {
        await invalidateCache()
      }

      return methodResult
    }

    return descriptor
  }
}
