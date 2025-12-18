import { MeasurePerformance } from './measure-performance'
import { Logger } from '@nestjs/common'

// Mock the logger
jest.mock('@nestjs/common', () => {
  const mockDebugFn = jest.fn()
  return {
    Logger: jest.fn().mockImplementation(() => ({
      debug: mockDebugFn,
    })),
  }
})

// Mock isPromise
jest.mock('@js-monorepo/utils/common', () => ({
  isPromise: (value: any) => value != null && (value instanceof Promise || typeof value.then === 'function'),
}))

// Mock performance.now
const mockPerformanceNow = jest.fn()
global.performance = {
  now: mockPerformanceNow,
} as any

describe('MeasurePerformance', () => {
  let mockTarget: any
  let mockPropertyKey: string
  let mockDescriptor: PropertyDescriptor
  let mockDebugSpy: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    // Get the mock function from the Logger mock
    const loggerInstance = new Logger('MeasurePerformance')
    mockDebugSpy = (loggerInstance as any).debug
    mockPerformanceNow.mockReturnValue(0)
    mockTarget = {
      constructor: { name: 'TestClass' },
    }
    mockPropertyKey = 'testMethod'
    mockDescriptor = {
      value: jest.fn(),
    }
  })

  it('should be defined', () => {
    expect(MeasurePerformance).toBeDefined()
  })

  it('should measure and log execution time for synchronous method', async () => {
    const returnValue = 'success'
    const originalMethod = jest.fn().mockReturnValue(returnValue)
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100) // 100ms
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = MeasurePerformance()(mockTarget, mockPropertyKey, mockDescriptor)
    const result = await decorated.value.call(mockTarget)

    expect(result).toBe(returnValue)
    expect(originalMethod).toHaveBeenCalledTimes(1)
    expect(mockDebugSpy).toHaveBeenCalledWith("[TestClass] - testMethod() - execution time: '0.1 seconds'")
  })

  it('should measure and log execution time for asynchronous method', async () => {
    const returnValue = 'success'
    const originalMethod = jest.fn().mockResolvedValue(returnValue)
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(250) // 250ms
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = MeasurePerformance()(mockTarget, mockPropertyKey, mockDescriptor)
    const result = await decorated.value.call(mockTarget)

    expect(result).toBe(returnValue)
    expect(originalMethod).toHaveBeenCalledTimes(1)
    expect(mockDebugSpy).toHaveBeenCalledWith("[TestClass] - testMethod() - execution time: '0.25 seconds'")
  })

  it('should format execution time correctly with 4 decimal places', async () => {
    const originalMethod = jest.fn().mockReturnValue('result')
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(1234.5678) // 1234.5678ms
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = MeasurePerformance()(mockTarget, mockPropertyKey, mockDescriptor)
    await decorated.value.call(mockTarget)

    expect(mockDebugSpy).toHaveBeenCalledWith("[TestClass] - testMethod() - execution time: '1.2346 seconds'")
  })

  it('should handle very fast execution times', async () => {
    const originalMethod = jest.fn().mockReturnValue('result')
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(0.5) // 0.5ms
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = MeasurePerformance()(mockTarget, mockPropertyKey, mockDescriptor)
    await decorated.value.call(mockTarget)

    expect(mockDebugSpy).toHaveBeenCalledWith("[TestClass] - testMethod() - execution time: '0.0005 seconds'")
  })

  it('should handle slow execution times', async () => {
    const originalMethod = jest.fn().mockReturnValue('result')
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(5000) // 5000ms = 5 seconds
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = MeasurePerformance()(mockTarget, mockPropertyKey, mockDescriptor)
    await decorated.value.call(mockTarget)

    expect(mockDebugSpy).toHaveBeenCalledWith("[TestClass] - testMethod() - execution time: '5 seconds'")
  })

  it('should preserve method arguments', async () => {
    const originalMethod = jest.fn().mockReturnValue('result')
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100)
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = MeasurePerformance()(mockTarget, mockPropertyKey, mockDescriptor)
    await decorated.value.call(mockTarget, 'arg1', 'arg2', 123)

    expect(originalMethod).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('should preserve method return value', async () => {
    const returnValue = { data: 'test', count: 42 }
    const originalMethod = jest.fn().mockReturnValue(returnValue)
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100)
    mockDescriptor = {
      value: originalMethod,
    }

    const decorated = MeasurePerformance()(mockTarget, mockPropertyKey, mockDescriptor)
    const result = await decorated.value.call(mockTarget)

    expect(result).toBe(returnValue)
    expect(result).toEqual(returnValue)
  })
})
