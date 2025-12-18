import { Retry } from './retry'

// Mock the logger
jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
  })),
}))

jest.mock('@js-monorepo/utils/common', () => ({
  isPromise: (value: any) => value != null && (value instanceof Promise || typeof value.then === 'function'),
}))

describe('Retry Decorator', () => {
  let mockTarget: any
  let mockPropertyKey: string
  let mockDescriptor: PropertyDescriptor

  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true })
    mockTarget = { constructor: { name: 'TestClass' } }
    mockPropertyKey = 'testMethod'
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('should retry the specified number of times on failure', async () => {
    const finalError = new Error('Final error')
    const originalMethod = jest.fn().mockImplementation(() => Promise.reject(finalError))
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Retry(2, 100)(mockTarget, mockPropertyKey, mockDescriptor)

    // Start the promise
    const promise = decorated.value.call(mockTarget)
    // Suppress unhandled rejection warning
    promise.catch(() => {})

    // Let initial call complete
    await Promise.resolve()

    // Process the first retry timeout (100ms)
    await jest.advanceTimersByTimeAsync(100)
    await Promise.resolve()

    // Process the second retry timeout (200ms)
    await jest.advanceTimersByTimeAsync(200)
    await Promise.resolve()

    // Now the promise should be rejected after all retries
    await expect(promise).rejects.toThrow('Final error')
    expect(originalMethod).toHaveBeenCalledTimes(3) // Initial + 2 retries
  })

  it('should return successfully if a retry succeeds', async () => {
    const error = new Error('Temporary error')
    const originalMethod = jest.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success')
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Retry(2, 100)(mockTarget, mockPropertyKey, mockDescriptor)

    const promise = decorated.value.call(mockTarget)

    // Advance through first retry timeout (100ms)
    await jest.advanceTimersByTimeAsync(100)
    await jest.runAllTimersAsync()

    const result = await promise
    expect(result).toBe('success')
    expect(originalMethod).toHaveBeenCalledTimes(2) // Initial + 1 retry
  })

  it('should return immediately on first success without retrying', async () => {
    const originalMethod = jest.fn().mockResolvedValue('immediate success')
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Retry(2, 100)(mockTarget, mockPropertyKey, mockDescriptor)

    const result = await decorated.value.call(mockTarget)

    expect(result).toBe('immediate success')
    expect(originalMethod).toHaveBeenCalledTimes(1)
  })

  it('should handle synchronous methods', async () => {
    const originalMethod = jest.fn().mockReturnValue('sync result')
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Retry(2, 100)(mockTarget, mockPropertyKey, mockDescriptor)

    const result = await decorated.value.call(mockTarget)

    expect(result).toBe('sync result')
    expect(originalMethod).toHaveBeenCalledTimes(1)
  })

  it('should use exponential backoff for retries', async () => {
    const error = new Error('Error')
    const originalMethod = jest.fn().mockImplementation(() => Promise.reject(error))
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Retry(2, 100)(mockTarget, mockPropertyKey, mockDescriptor)

    const promise = decorated.value.call(mockTarget)
    // Suppress unhandled rejection warning
    promise.catch(() => {})

    // Let initial call complete
    await Promise.resolve()
    expect(originalMethod).toHaveBeenCalledTimes(1)

    // First retry: 100ms * 2^0 = 100ms
    await jest.advanceTimersByTimeAsync(100)
    await Promise.resolve()
    expect(originalMethod).toHaveBeenCalledTimes(2)

    // Second retry: 100ms * 2^1 = 200ms
    await jest.advanceTimersByTimeAsync(200)
    await Promise.resolve()
    expect(originalMethod).toHaveBeenCalledTimes(3)

    await expect(promise).rejects.toThrow('Error')
  })
})
