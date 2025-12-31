import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor, Optional } from '@nestjs/common'
import { RedisClientType } from 'redis'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'
import { REDIS } from '../redis'

const DEFAULT_TTL_SECONDS = 86400 // 24 hours
const DEFAULT_HEADER = 'idempotency-key'
const DEFAULT_PREFIX = 'idempotency:'

export const IDEMPOTENCY_CONFIG = Symbol('IDEMPOTENCY_CONFIG')

export interface IdempotencyConfig {
  /** TTL in seconds for cached responses. Default: 86400 (24 hours) */
  ttlSeconds?: number
  /** Redis key prefix. Default: 'idempotency:' */
  prefix?: string
  /** Header name to read the idempotency key from. Default: 'idempotency-key' */
  headerName?: string
}

/**
 * NestJS interceptor that provides idempotency for POST/PUT/PATCH requests.
 *
 * When a client sends a request with an idempotency key header, the interceptor:
 * 1. Checks if a cached response exists for that key
 * 2. If cached, returns the cached response immediately
 * 3. If not cached, processes the request and caches the response
 *
 * This prevents duplicate operations when clients retry requests or double-click.
 *
 * @example
 * // In your controller:
 * @Post('checkout')
 * @UseInterceptors(IdempotencyInterceptor)
 * async checkout(@Body() dto: CheckoutDto) {
 *   return this.service.checkout(dto)
 * }
 *
 * @example
 * // To configure globally in a module:
 * providers: [
 *   {
 *     provide: IDEMPOTENCY_CONFIG,
 *     useValue: { ttlSeconds: 3600, prefix: 'myapp:idempotency:' }
 *   }
 * ]
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly ttl: number
  private readonly prefix: string
  private readonly headerName: string

  constructor(
    @Optional() @Inject(REDIS) private readonly redis?: RedisClientType,
    @Optional() @Inject(IDEMPOTENCY_CONFIG) config?: IdempotencyConfig
  ) {
    this.ttl = config?.ttlSeconds ?? DEFAULT_TTL_SECONDS
    this.prefix = config?.prefix ?? DEFAULT_PREFIX
    this.headerName = config?.headerName ?? DEFAULT_HEADER
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest()
    const idempotencyKey = request.headers[this.headerName]

    // No key or no Redis = proceed without idempotency
    if (!idempotencyKey || !this.redis) {
      return next.handle()
    }

    const cacheKey = `${this.prefix}${idempotencyKey}`

    try {
      const cached = await this.redis.get(cacheKey)

      if (cached) {
        return of(JSON.parse(cached))
      }
    } catch {
      // Redis error, continue without idempotency
      return next.handle()
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.redis.set(cacheKey, JSON.stringify(response), { EX: this.ttl })
        } catch {
          // Redis error, ignore - response was still processed
        }
      })
    )
  }
}
