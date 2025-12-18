import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { WsRolesGuard } from './ws-roles.guard'

describe('WsRolesGuard', () => {
  let guard: WsRolesGuard
  let reflector: Reflector
  let authSessionUserCacheService: jest.Mocked<AuthSessionUserCacheService>
  let mockExecutionContext: jest.Mocked<ExecutionContext>

  beforeEach(async () => {
    reflector = new Reflector()
    authSessionUserCacheService = {
      findOrSaveAuthUserById: jest.fn(),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsRolesGuard,
        {
          provide: Reflector,
          useValue: reflector,
        },
        {
          provide: AuthSessionUserCacheService,
          useValue: authSessionUserCacheService,
        },
      ],
    }).compile()

    guard = module.get<WsRolesGuard>(WsRolesGuard)
    mockExecutionContext = {
      switchToWs: jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue({
          user: {
            id: 1,
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
    it('should return false when no roles are required', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(false)
    })

    it('should return true when user has required role', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolesEnum.USER])
      authSessionUserCacheService.findOrSaveAuthUserById.mockResolvedValue({
        id: 1,
        username: 'test',
        email: 'test@example.com',
        roles: [RolesEnum.USER],
      } as any)

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
      expect(authSessionUserCacheService.findOrSaveAuthUserById).toHaveBeenCalledWith(1)
    })

    it('should return false when user does not have required role', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolesEnum.ADMIN])
      authSessionUserCacheService.findOrSaveAuthUserById.mockResolvedValue({
        id: 1,
        username: 'test',
        email: 'test@example.com',
        roles: [RolesEnum.USER],
      } as any)

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(false)
    })

    it('should return false when user id is not present', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolesEnum.USER])
      mockExecutionContext.switchToWs().getClient().user = {}

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(false)
      expect(authSessionUserCacheService.findOrSaveAuthUserById).not.toHaveBeenCalled()
    })

    it('should return false when session user is not found', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolesEnum.USER])
      authSessionUserCacheService.findOrSaveAuthUserById.mockResolvedValue(undefined)

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(false)
    })
  })
})
