import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * Global interceptor to remove null, undefined, and empty objects from responses.
 *
 * This interceptor recursively cleans response data by:
 * - Removing null and undefined values
 * - Removing empty objects (objects with no properties)
 * - Preserving arrays, even if empty (as they may be meaningful)
 * - Handling nested structures safely
 *
 * Usage:
 *   app.useGlobalInterceptors(new RemoveEmptyInterceptor())
 *
 * Example:
 *   Input:  { user: {...}, featureFlags: {}, subscription: null }
 *   Output: { user: {...} }
 */
@Injectable()
export class RemoveEmptyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.cleanData(data)))
  }

  private cleanData(value: any, visited = new WeakSet()): any {
    // Handle null and undefined
    if (value === null || value === undefined) {
      return undefined
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => this.cleanData(item, visited)).filter((item) => item !== undefined)
    }

    // Handle objects
    if (value && typeof value === 'object') {
      // Prevent circular references
      if (visited.has(value)) {
        return value
      }
      visited.add(value)

      const cleanedObj = Object.entries(value).reduce(
        (acc, [key, val]) => {
          const cleanedVal = this.cleanData(val, visited)

          // Skip undefined and null values
          if (cleanedVal === undefined || cleanedVal === null) {
            return acc
          }

          // Skip empty objects (but preserve empty arrays as they may be meaningful)
          if (typeof cleanedVal === 'object' && !Array.isArray(cleanedVal) && Object.keys(cleanedVal).length === 0) {
            return acc
          }

          acc[key] = cleanedVal
          return acc
        },
        {} as Record<string, any>
      )

      // If the object has no remaining properties, return undefined to drop it
      return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined
    }

    // Return primitives as-is (numbers, strings, booleans, etc.)
    return value
  }
}
