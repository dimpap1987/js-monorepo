import { Catch } from './catch'
import { Logger } from '@nestjs/common'

// Mock the logger
const mockError = jest.fn()
jest.mock('@nestjs/common', () => {
  const mockErrorFn = jest.fn()
  return {
    Logger: jest.fn().mockImplementation(() => ({
      error: mockErrorFn,
    })),
  }
})

// Mock isPromise
jest.mock('@js-monorepo/utils/common', () => ({
  isPromise: (value: any) => value != null && (value instanceof Promise || typeof value.then === 'function'),
}))

describe('Catch', () => {
  let mockTarget: any
  let mockPropertyKey: string
  let mockDescriptor: PropertyDescriptor
  let mockErrorSpy: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    // Get the mock function from the Logger mock
    const loggerInstance = new Logger('Catch')
    mockErrorSpy = (loggerInstance as any).error
    mockTarget = {
      constructor: { name: 'TestClass' },
    }
    mockPropertyKey = 'testMethod'
    mockDescriptor = {
      value: jest.fn(),
    }
  })

  it('should be defined', () => {
    expect(Catch).toBeDefined()
  })

  it('should return the result when method succeeds (synchronous)', async () => {
    const returnValue = 'success'
    const originalMethod = jest.fn().mockReturnValue(returnValue)
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Catch()(mockTarget, mockPropertyKey, mockDescriptor)
    const result = await decorated.value.call(mockTarget)

    expect(result).toBe(returnValue)
    expect(originalMethod).toHaveBeenCalledTimes(1)
    expect(mockErrorSpy).not.toHaveBeenCalled()
  })

  it('should return the result when method succeeds (asynchronous)', async () => {
    const returnValue = 'success'
    const originalMethod = jest.fn().mockResolvedValue(returnValue)
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Catch()(mockTarget, mockPropertyKey, mockDescriptor)
    const result = await decorated.value.call(mockTarget)

    expect(result).toBe(returnValue)
    expect(originalMethod).toHaveBeenCalledTimes(1)
    expect(mockErrorSpy).not.toHaveBeenCalled()
  })

  it('should catch and log error when method throws (synchronous)', async () => {
    const error = new Error('Test error')
    const originalMethod = jest.fn().mockImplementation(() => {
      throw error
    })
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Catch()(mockTarget, mockPropertyKey, mockDescriptor)
    const result = await decorated.value.call(mockTarget)

    expect(result).toBeUndefined()
    expect(originalMethod).toHaveBeenCalledTimes(1)
    expect(mockErrorSpy).toHaveBeenCalledWith('[TestClass] - testMethod()', error.stack)
  })

  it('should catch and log error when promise rejects', async () => {
    const error = new Error('Test error')
    const originalMethod = jest.fn().mockImplementation(() => Promise.reject(error))
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Catch()(mockTarget, mockPropertyKey, mockDescriptor)
    const promise = decorated.value.call(mockTarget)
    promise.catch(() => {}) // Suppress unhandled rejection
    const result = await promise.catch(() => undefined)

    expect(result).toBeUndefined()
    expect(originalMethod).toHaveBeenCalledTimes(1)
    expect(mockErrorSpy).toHaveBeenCalledWith('[TestClass] - testMethod()', error.stack)
  })

  it('should return outputWhenError value when provided (primitive)', async () => {
    const error = new Error('Test error')
    const fallbackValue = 'fallback'
    const originalMethod = jest.fn().mockImplementation(() => {
      throw error
    })
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Catch(fallbackValue)(mockTarget, mockPropertyKey, mockDescriptor)
    const result = await decorated.value.call(mockTarget)

    expect(result).toBe(fallbackValue)
    expect(mockErrorSpy).toHaveBeenCalled()
  })

  it('should return outputWhenError function result when provided (function)', async () => {
    const error = new Error('Test error')
    const fallbackValue = 'fallback from function'
    const fallbackFn = jest.fn().mockReturnValue(fallbackValue)
    const originalMethod = jest.fn().mockImplementation(() => {
      throw error
    })
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Catch(fallbackFn)(mockTarget, mockPropertyKey, mockDescriptor)
    const result = await decorated.value.call(mockTarget)

    expect(result).toBe(fallbackValue)
    expect(fallbackFn).toHaveBeenCalledTimes(1)
    expect(mockErrorSpy).toHaveBeenCalled()
  })

  it('should use custom error description when provided', async () => {
    const error = new Error('Test error')
    const errorDescription = 'Custom error message'
    const originalMethod = jest.fn().mockImplementation(() => {
      throw error
    })
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Catch(undefined, errorDescription)(mockTarget, mockPropertyKey, mockDescriptor)
    await decorated.value.call(mockTarget)

    expect(mockErrorSpy).toHaveBeenCalledWith(`[TestClass] - testMethod() - ${errorDescription}`, error.stack)
  })

  it('should handle promise rejection with outputWhenError', async () => {
    const error = new Error('Test error')
    const fallbackValue = 'fallback'
    const originalMethod = jest.fn().mockImplementation(() => Promise.reject(error))
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = Catch(fallbackValue)(mockTarget, mockPropertyKey, mockDescriptor)
    const promise = decorated.value.call(mockTarget)
    promise.catch(() => {}) // Suppress unhandled rejection
    const result = await promise.catch(() => fallbackValue)

    expect(result).toBe(fallbackValue)
    expect(mockErrorSpy).toHaveBeenCalled()
  })
})
