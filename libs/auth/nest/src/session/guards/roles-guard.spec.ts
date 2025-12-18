import { ExecutionContext, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthException } from '../../common/exceptions/api-exception'
import { RolesEnum } from '../../common/types'
import { RolesGuard } from './roles-guard'

describe('RolesGuard', () => {
  let guard: RolesGuard
  let reflector: Reflector
  let mockExecutionContext: jest.Mocked<ExecutionContext>

  beforeEach(async () => {
    reflector = new Reflector()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile()

    guard = module.get<RolesGuard>(RolesGuard)
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          isAuthenticated: jest.fn().mockReturnValue(true),
          user: {
            user: {
              roles: [RolesEnum.USER],
            },
          },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)

      const result = guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
    })

    it('should return true when user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolesEnum.USER])
      const request = mockExecutionContext.switchToHttp().getRequest()
      request.isAuthenticated.mockReturnValue(true)
      request.user = {
        user: {
          roles: [RolesEnum.USER],
        },
      }

      const result = guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
    })

    it('should throw AuthException when user does not have required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolesEnum.ADMIN])
      const request = mockExecutionContext.switchToHttp().getRequest()
      request.isAuthenticated.mockReturnValue(true)
      request.user = {
        user: {
          roles: [RolesEnum.USER],
        },
      }

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(AuthException)

      try {
        guard.canActivate(mockExecutionContext)
      } catch (error: any) {
        expect(error).toBeInstanceOf(AuthException)
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN)
        expect(error.message).toContain('Invalid privileges')
      }
    })

    it('should throw AuthException when user is not authenticated', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolesEnum.USER])
      const request = mockExecutionContext.switchToHttp().getRequest()
      request.isAuthenticated.mockReturnValue(false)

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(AuthException)
    })
  })
})
