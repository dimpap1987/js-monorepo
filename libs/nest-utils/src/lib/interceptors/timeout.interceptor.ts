import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from '@nestjs/common'
import { TimeoutError, catchError, throwError, timeout } from 'rxjs'

/**
 * Global timeout interceptor to enforce a maximum request processing time.
 *
 * Usage:
 *   app.useGlobalInterceptors(new TimeoutInterceptor(30_000))
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly ms = 30_000) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      timeout(this.ms),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException())
        }
        return throwError(() => err)
      })
    )
  }
}
