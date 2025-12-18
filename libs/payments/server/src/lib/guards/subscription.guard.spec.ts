import { ExecutionContext, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SubscriptionGuard } from './subscription.guard'
import { PaymentsService } from '../service/payments.service'
import { ApiException } from '@js-monorepo/nest/exceptions'

describe('SubscriptionGuard', () => {
  let guard: SubscriptionGuard
  let mockReflector: jest.Mocked<Reflector>
  let mockPaymentsService: jest.Mocked<PaymentsService>
  let mockExecutionContext: jest.Mocked<ExecutionContext>

  beforeEach(() => {
    mockReflector = {
      get: jest.fn(),
    } as any

    mockPaymentsService = {
      getHighestActivePlanByUser: jest.fn(),
      findProductyByName: jest.fn(),
    } as any

    guard = new SubscriptionGuard(mockReflector, mockPaymentsService)

    mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            user: {
              id: 1,
            },
          },
        }),
      }),
    } as any
  })

  describe('canActivate', () => {
    it('should return true when no required product is specified', async () => {
      mockReflector.get.mockReturnValue(undefined)

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
      expect(mockPaymentsService.getHighestActivePlanByUser).not.toHaveBeenCalled()
    })

    it('should return false when user is not authenticated', async () => {
      mockReflector.get.mockReturnValue('premium')
      const request = mockExecutionContext.switchToHttp().getRequest()
      request.user = null

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(false)
      expect(mockPaymentsService.getHighestActivePlanByUser).not.toHaveBeenCalled()
    })

    it('should return true when user has sufficient subscription hierarchy', async () => {
      mockReflector.get.mockReturnValue('premium')
      mockPaymentsService.getHighestActivePlanByUser.mockResolvedValue(5)
      mockPaymentsService.findProductyByName.mockResolvedValue({ id: 1, name: 'premium', hierarchy: 3 })

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
      expect(mockPaymentsService.getHighestActivePlanByUser).toHaveBeenCalledWith(1)
      expect(mockPaymentsService.findProductyByName).toHaveBeenCalledWith('premium')
    })

    it('should throw ApiException when user has insufficient subscription hierarchy', async () => {
      mockReflector.get.mockReturnValue('premium')
      mockPaymentsService.getHighestActivePlanByUser.mockResolvedValue(2)
      mockPaymentsService.findProductyByName.mockResolvedValue({ id: 2, name: 'premium', hierarchy: 5 })

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(ApiException)

      try {
        await guard.canActivate(mockExecutionContext)
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApiException)
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN)
        expect(error.getErrorCode()).toBe('INSUFFICIENT_SUBSCRIPTION')
      }
    })

    it('should return true when user hierarchy equals required hierarchy (edge case - equal is sufficient)', async () => {
      mockReflector.get.mockReturnValue('premium')
      mockPaymentsService.getHighestActivePlanByUser.mockResolvedValue(5)
      mockPaymentsService.findProductyByName.mockResolvedValue({ id: 3, name: 'premium', hierarchy: 5 })

      const result = await guard.canActivate(mockExecutionContext)

      expect(result).toBe(true)
    })

    it('should handle user with no subscription (hierarchy 0)', async () => {
      mockReflector.get.mockReturnValue('basic')
      mockPaymentsService.getHighestActivePlanByUser.mockResolvedValue(0)
      mockPaymentsService.findProductyByName.mockResolvedValue({ id: 4, name: 'basic', hierarchy: 1 })

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(ApiException)
    })

    it('should call reflector with correct metadata key', async () => {
      mockReflector.get.mockReturnValue(undefined)

      await guard.canActivate(mockExecutionContext)

      expect(mockReflector.get).toHaveBeenCalledWith('hasProduct', mockExecutionContext.getHandler())
    })
  })
})
