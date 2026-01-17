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
 * - Preserving Date objects and date-related fields
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

  /**
   * Check if a value is a Date object using multiple methods for reliability
   */
  private isDate(value: any): boolean {
    if (!value) return false
    // Check instanceof (works for same-realm dates)
    if (value instanceof Date) return true
    // Check Object.prototype.toString (works cross-realm)
    if (Object.prototype.toString.call(value) === '[object Date]') return true
    // Check for date-like object with getTime method
    if (typeof value.getTime === 'function' && typeof value.toISOString === 'function') return true
    return false
  }

  private cleanData(value: any, visited = new WeakSet(), key?: string): any {
    // Handle null and undefined
    if (value === null || value === undefined) {
      return undefined
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => this.cleanData(item, visited)).filter((item) => item !== undefined)
    }

    // Handle Date objects - return as-is (they serialize to ISO strings)
    if (this.isDate(value)) {
      return value
    }

    // Handle objects
    if (value && typeof value === 'object') {
      // Prevent circular references
      if (visited.has(value)) {
        return value
      }
      visited.add(value)

      const cleanedObj = Object.entries(value).reduce(
        (acc, [objKey, val]) => {
          const cleanedVal = this.cleanData(val, visited, objKey)

          // Skip undefined and null values
          if (cleanedVal === undefined || cleanedVal === null) {
            return acc
          }

          // Explicitly preserve Date objects - they have no enumerable properties
          // so they would otherwise be treated as empty objects
          if (this.isDate(cleanedVal)) {
            acc[objKey] = cleanedVal
            return acc
          }

          // Skip empty objects (but preserve empty arrays as they may be meaningful)
          if (typeof cleanedVal === 'object' && !Array.isArray(cleanedVal) && Object.keys(cleanedVal).length === 0) {
            return acc
          }

          acc[objKey] = cleanedVal
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
