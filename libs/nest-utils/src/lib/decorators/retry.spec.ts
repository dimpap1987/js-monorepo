import { Retry } from './retry'

// Mock the logger
jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
  })),
}))

jest.mock('@js-monorepo/utils/common', () => ({
  isPromise: (value: any) => value instanceof Promise,
}))

describe('Retry', () => {
  let mockTarget: any
  let mockPropertyKey: string
  let mockDescriptor: PropertyDescriptor

  beforeEach(() => {
    jest.useFakeTimers()
    mockTarget = {
      constructor: { name: 'TestClass' },
    }
    mockPropertyKey = 'testMethod'
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('Retry decorator', () => {
    it('should return descriptor', () => {
      mockDescriptor = {
        value: jest.fn(),
      }
      const result = Retry(3)(mockTarget, mockPropertyKey, mockDescriptor)

      expect(result).toBe(mockDescriptor)
    })

    it('should succeed on first attempt', async () => {
      const successValue = { data: 'success' }
      const originalMethod = jest.fn().mockResolvedValue(successValue)
      mockDescriptor = {
        value: originalMethod,
      }

      const decorated = Retry(3)(mockTarget, mockPropertyKey, mockDescriptor)
      const result = await decorated.value.call(mockTarget, 'arg1', 'arg2')

      expect(result).toEqual(successValue)
      expect(originalMethod).toHaveBeenCalledTimes(1)
      expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should retry on failure and succeed on second attempt', async () => {
      const originalMethod = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce({ data: 'success' })
      mockDescriptor = {
        value: originalMethod,
      }

      const decorated = Retry(3, 100)(mockTarget, mockPropertyKey, mockDescriptor)
      const promise = decorated.value.call(mockTarget)

      // Fast-forward time to skip the timeout
      await jest.advanceTimersByTimeAsync(100)

      const result = await promise

      expect(result).toEqual({ data: 'success' })
      expect(originalMethod).toHaveBeenCalledTimes(2)
    })

    it('should retry with exponential backoff', async () => {
      const originalMethod = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce({ data: 'success' })
      mockDescriptor = {
        value: originalMethod,
      }

      const decorated = Retry(3, 100)(mockTarget, mockPropertyKey, mockDescriptor)
      const promise = decorated.value.call(mockTarget)

      // First retry: 100ms
      await jest.advanceTimersByTimeAsync(100)
      // Second retry: 200ms (100 * 2^1)
      await jest.advanceTimersByTimeAsync(200)

      const result = await promise

      expect(result).toEqual({ data: 'success' })
      expect(originalMethod).toHaveBeenCalledTimes(3)
    })

    it('should throw error after all retries exhausted', async () => {
      const finalError = new Error('Final error')
      const originalMethod = jest.fn().mockRejectedValue(finalError)
      mockDescriptor = {
        value: originalMethod,
      }

      const decorated = Retry(2, 100)(mockTarget, mockPropertyKey, mockDescriptor)
      const promise = decorated.value.call(mockTarget)

      // Fast-forward through all retries
      await jest.advanceTimersByTimeAsync(100) // First retry
      await jest.advanceTimersByTimeAsync(200) // Second retry (exponential backoff)

      await expect(promise).rejects.toThrow('Final error')
      expect(originalMethod).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should handle synchronous methods', () => {
      const syncValue = 'sync result'
      const originalMethod = jest.fn().mockReturnValue(syncValue)
      mockDescriptor = {
        value: originalMethod,
      }

      const decorated = Retry(3)(mockTarget, mockPropertyKey, mockDescriptor)
      const result = decorated.value.call(mockTarget)

      expect(result).toBe(syncValue)
      expect(originalMethod).toHaveBeenCalledTimes(1)
    })

    it('should handle synchronous methods that throw', async () => {
      const error = new Error('Sync error')
      const originalMethod = jest.fn().mockImplementation(() => {
        throw error
      })
      mockDescriptor = {
        value: originalMethod,
      }

      const decorated = Retry(2, 100)(mockTarget, mockPropertyKey, mockDescriptor)
      const promise = decorated.value.call(mockTarget)

      await jest.advanceTimersByTimeAsync(100)
      await jest.advanceTimersByTimeAsync(200)

      await expect(promise).rejects.toThrow('Sync error')
      expect(originalMethod).toHaveBeenCalledTimes(3)
    })

    it('should preserve method context (this binding)', async () => {
      class TestClass {
        value = 'test'

        async getValue() {
          return this.value
        }
      }

      // Apply decorator manually since we can't use @Retry in test
      const originalMethod = TestClass.prototype.getValue
      const decorated = Retry(1)(TestClass.prototype, 'getValue', {
        value: originalMethod,
      })
      TestClass.prototype.getValue = decorated.value

      const instance = new TestClass()
      const result = await instance.getValue()

      expect(result).toBe('test')
    })

    it('should handle zero retries', async () => {
      const error = new Error('Error')
      const originalMethod = jest.fn().mockRejectedValue(error)
      mockDescriptor = {
        value: originalMethod,
      }

      const decorated = Retry(0, 100)(mockTarget, mockPropertyKey, mockDescriptor)
      const promise = decorated.value.call(mockTarget)

      await expect(promise).rejects.toThrow('Error')
      expect(originalMethod).toHaveBeenCalledTimes(1) // Only initial call
    })

    it('should use default timeout of 2000ms', async () => {
      const originalMethod = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce({ data: 'success' })
      mockDescriptor = {
        value: originalMethod,
      }

      const decorated = Retry(1)(mockTarget, mockPropertyKey, mockDescriptor)
      const promise = decorated.value.call(mockTarget)

      // Default timeout is 2000ms
      await jest.advanceTimersByTimeAsync(2000)

      const result = await promise
      expect(result).toEqual({ data: 'success' })
      expect(originalMethod).toHaveBeenCalledTimes(2)
    })
  })
})
