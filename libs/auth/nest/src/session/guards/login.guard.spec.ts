import { ExecutionContext, HttpStatus } from '@nestjs/common'
import { LoggedInGuard } from './login.guard'
import { AuthException } from '../../common/exceptions/api-exception'

describe('LoggedInGuard', () => {
  let guard: LoggedInGuard
  let mockExecutionContext: jest.Mocked<ExecutionContext>

  beforeEach(() => {
    guard = new LoggedInGuard()
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          isAuthenticated: jest.fn(),
        }),
      }),
    } as any
  })

  describe('canActivate', () => {
    it('should return true when user is authenticated', () => {
      const request = mockExecutionContext.switchToHttp().getRequest()
      request.isAuthenticated.mockReturnValue(true)

      const result = guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
      expect(request.isAuthenticated).toHaveBeenCalled()
    })

    it('should throw AuthException when user is not authenticated', () => {
      const request = mockExecutionContext.switchToHttp().getRequest()
      request.isAuthenticated.mockReturnValue(false)

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(AuthException)

      try {
        guard.canActivate(mockExecutionContext)
      } catch (error: any) {
        expect(error).toBeInstanceOf(AuthException)
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN)
        expect(error.message).toContain('Invalid session')
      }
    })

    it('should handle request with undefined isAuthenticated', () => {
      const request = mockExecutionContext.switchToHttp().getRequest()
      request.isAuthenticated = undefined as any

      expect(() => guard.canActivate(mockExecutionContext)).toThrow()
    })
  })
})
