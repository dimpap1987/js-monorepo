import { Injectable, PipeTransform } from '@nestjs/common'
import { ZodSchema, ZodError } from 'zod'
import { ApiException } from '../exceptions/api-exception'
import { HttpStatus } from '@nestjs/common'

/**
 * Pipe that normalizes empty strings to undefined and validates query parameters using Zod schema
 */
@Injectable()
export class QueryValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: any) {
    // When used with @Query() without param name, value is the entire query object
    // Normalize empty strings to undefined
    const normalized = this.normalizeEmptyStrings(value || {})

    const result = this.schema.safeParse(normalized)

    if (result.success === false) {
      const errorMessages = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      throw new ApiException(HttpStatus.BAD_REQUEST, `Invalid query parameters: ${errorMessages}`)
    }

    return result.data
  }

  /**
   * Recursively normalizes empty strings to undefined in objects
   */
  private normalizeEmptyStrings(value: any): any {
    if (value === '') {
      return undefined
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, this.normalizeEmptyStrings(val)]))
    }
    return value
  }
}
