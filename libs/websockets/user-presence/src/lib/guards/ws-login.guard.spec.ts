import { ExecutionContext } from '@nestjs/common'
import { WsLoginGuard } from './ws-login.guard'

describe('WsLoginGuard', () => {
  let guard: WsLoginGuard
  let mockExecutionContext: jest.Mocked<ExecutionContext>

  beforeEach(() => {
    guard = new WsLoginGuard()
    mockExecutionContext = {
      switchToWs: jest.fn().mockReturnValue({
        getClient: jest.fn().mockReturnValue({
          user: {
            id: 'user-id-123',
          },
        }),
      }),
    } as any
  })

  describe('canActivate', () => {
    it('should return true when user has id', async () => {
      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
      expect(mockExecutionContext.switchToWs).toHaveBeenCalled()
    })

    it('should return false when user does not have id', async () => {
      mockExecutionContext.switchToWs().getClient().user = {}

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(false)
    })

    it('should return false when user is undefined', async () => {
      mockExecutionContext.switchToWs().getClient().user = undefined

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(false)
    })
  })
})
