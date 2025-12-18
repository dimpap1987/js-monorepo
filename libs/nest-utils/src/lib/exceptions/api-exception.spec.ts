import { HttpStatus } from '@nestjs/common'
import { ApiException } from './api-exception'

describe('ApiException', () => {
  describe('constructor', () => {
    it('should create exception with status and error code', () => {
      const exception = new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CODE')

      expect(exception).toBeInstanceOf(ApiException)
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST)
      expect(exception.getErrorCode()).toBe('ERROR_CODE')
    })

    it('should create exception with custom message', () => {
      const exception = new ApiException(HttpStatus.NOT_FOUND, 'NOT_FOUND', 'Resource not found')

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND)
      expect(exception.getErrorCode()).toBe('NOT_FOUND')
      expect(exception.message).toBe('Resource not found')
    })

    it('should use default message when not provided', () => {
      const exception = new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, 'ERROR_CODE')

      expect(exception.message).toBe('An unexpected error occurred.')
    })

    it('should default to INTERNAL_SERVER_ERROR when status is not provided', () => {
      const exception = new ApiException(undefined as any, 'ERROR_CODE')

      expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('getErrorCode', () => {
    it('should return the error code', () => {
      const exception = new ApiException(HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR')

      expect(exception.getErrorCode()).toBe('VALIDATION_ERROR')
    })

    it('should return different error codes for different exceptions', () => {
      const exception1 = new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_1')
      const exception2 = new ApiException(HttpStatus.NOT_FOUND, 'ERROR_2')

      expect(exception1.getErrorCode()).toBe('ERROR_1')
      expect(exception2.getErrorCode()).toBe('ERROR_2')
    })
  })

  describe('inheritance', () => {
    it('should extend HttpException', () => {
      const exception = new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CODE')

      expect(exception).toBeInstanceOf(Error)
      // ApiException extends HttpException which extends Error
    })

    it('should be throwable and catchable', () => {
      const exception = new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CODE')

      expect(() => {
        throw exception
      }).toThrow(ApiException)

      try {
        throw exception
      } catch (error) {
        expect(error).toBe(exception)
        expect((error as ApiException).getErrorCode()).toBe('ERROR_CODE')
      }
    })
  })

  describe('different HTTP status codes', () => {
    it('should handle BAD_REQUEST status', () => {
      const exception = new ApiException(HttpStatus.BAD_REQUEST, 'BAD_REQUEST')

      expect(exception.getStatus()).toBe(400)
    })

    it('should handle UNAUTHORIZED status', () => {
      const exception = new ApiException(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED')

      expect(exception.getStatus()).toBe(401)
    })

    it('should handle FORBIDDEN status', () => {
      const exception = new ApiException(HttpStatus.FORBIDDEN, 'FORBIDDEN')

      expect(exception.getStatus()).toBe(403)
    })

    it('should handle NOT_FOUND status', () => {
      const exception = new ApiException(HttpStatus.NOT_FOUND, 'NOT_FOUND')

      expect(exception.getStatus()).toBe(404)
    })

    it('should handle INTERNAL_SERVER_ERROR status', () => {
      const exception = new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, 'SERVER_ERROR')

      expect(exception.getStatus()).toBe(500)
    })
  })
})
