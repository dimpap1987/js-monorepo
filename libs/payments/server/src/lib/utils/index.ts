import { Logger } from '@nestjs/common'

const logger = new Logger('PaymentsUtils')

interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  shouldRetry?: (error: unknown) => boolean
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: (error: unknown) => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      return message.includes('rate_limit') || message.includes('timeout') || message.includes('network')
    }
    return false
  },
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Executes a function with exponential backoff retry logic.
 * Useful for Stripe API calls that may fail due to rate limits or network issues.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs, shouldRetry } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  }

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs)
      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Converts Unix timestamp (seconds) to Date object.
 * Returns undefined if timestamp is null/undefined.
 */
export function timestampToDate(timestamp: number | null | undefined): Date | undefined {
  if (timestamp == null) {
    return undefined
  }
  return new Date(timestamp * 1000)
}

/**
 * Converts Unix timestamp (seconds) to Date object.
 * Throws if timestamp is null/undefined. Use for required fields.
 */
export function timestampToDateRequired(timestamp: number): Date {
  return new Date(timestamp * 1000)
}
