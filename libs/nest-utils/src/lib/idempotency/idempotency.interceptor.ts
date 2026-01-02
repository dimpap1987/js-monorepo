import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor, Optional } from '@nestjs/common'
import { RedisClientType } from 'redis'
import { Observable, of, throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { REDIS } from '../redis'

const DEFAULT_TTL_SECONDS = 86400 // 24 hours
const DEFAULT_HEADER = 'idempotency-key'
const DEFAULT_PREFIX = 'idempotency:'
const PROCESSING_SUFFIX = ':processing'
const PROCESSING_TTL_SECONDS = 30

export const IDEMPOTENCY_CONFIG = Symbol('IDEMPOTENCY_CONFIG')

export interface IdempotencyConfig {
  /** TTL in seconds for cached responses. Default: 86400 (24 hours) */
  ttlSeconds?: number
  /** Redis key prefix. Default: 'idempotency:' */
  prefix?: string
  /** Header name to read the idempotency key from. Default: 'idempotency-key' */
  headerName?: string
  /** Max wait time in ms when another request is processing. Default: 5000 */
  maxWaitMs?: number
}

/**
 * NestJS interceptor that provides idempotency for POST/PUT/PATCH requests.
 *
 * When a client sends a request with an idempotency key header, the interceptor:
 * 1. Checks if a cached response exists for that key
 * 2. If cached, returns the cached response immediately
 * 3. If not cached, acquires a processing lock and processes the request
 * 4. Caches the response and releases the lock
 *
 * This prevents duplicate operations when clients retry requests or double-click,
 * even across multiple server instances.
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
  private readonly maxWaitMs: number

  constructor(
    @Optional() @Inject(REDIS) private readonly redis?: RedisClientType,
    @Optional() @Inject(IDEMPOTENCY_CONFIG) config?: IdempotencyConfig
  ) {
    this.ttl = config?.ttlSeconds ?? DEFAULT_TTL_SECONDS
    this.prefix = config?.prefix ?? DEFAULT_PREFIX
    this.headerName = config?.headerName ?? DEFAULT_HEADER
    this.maxWaitMs = config?.maxWaitMs ?? 5000
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest()
    const idempotencyKey = request.headers[this.headerName]

    // No key or no Redis = proceed without idempotency
    if (!idempotencyKey || !this.redis) {
      return next.handle()
    }

    const cacheKey = `${this.prefix}${idempotencyKey}`
    const processingKey = `${cacheKey}${PROCESSING_SUFFIX}`

    try {
      // Check for cached response first
      const cached = await this.redis.get(cacheKey)
      if (cached) {
        return of(JSON.parse(cached))
      }

      // Try to acquire processing lock using SET NX
      const lockAcquired = await this.redis.set(processingKey, '1', {
        NX: true,
        EX: PROCESSING_TTL_SECONDS,
      })

      if (!lockAcquired) {
        // Another request is processing, wait for result
        const result = await this.waitForResult(cacheKey)
        if (result) {
          return of(result)
        }
        // If we couldn't get a result, let this request proceed
        // (the other request may have failed)
      }

      // We have the lock, process the request
      return next.handle().pipe(
        tap(async (response) => {
          try {
            await this.redis?.set(cacheKey, JSON.stringify(response), { EX: this.ttl })
          } catch {
            // Redis error, ignore - response was still processed
          } finally {
            // Always release the processing lock
            await this.redis?.del(processingKey).catch(() => {})
          }
        }),
        catchError((error) => {
          // Release lock on error
          this.redis?.del(processingKey).catch(() => {})
          return throwError(() => error)
        })
      )
    } catch {
      // Redis error, continue without idempotency
      return next.handle()
    }
  }

  private async waitForResult(cacheKey: string): Promise<unknown | null> {
    const startTime = Date.now()
    const pollInterval = 100

    while (Date.now() - startTime < this.maxWaitMs) {
      await this.delay(pollInterval)
      try {
        const cached = await this.redis?.get(cacheKey)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch {
        return null
      }
    }

    return null
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
