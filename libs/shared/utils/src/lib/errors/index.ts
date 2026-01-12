/**
 * Standardized error structure for API responses
 */
export interface ApiError {
  code?: string
  message: string
  path?: string | string[]
  validation?: string
}

/**
 * API error response shape from backend
 */
export interface ApiErrorResponse {
  ok?: false
  status?: number
  message?: string
  errors?: ApiError[] | string[]
  createdBy?: string
  path?: string
}

/**
 * Parsed error result with extracted messages
 */
export interface ParsedError {
  message: string
  errors: string[]
  isValidationError: boolean
  isNetworkError: boolean
  rawError: unknown
}

/**
 * Options for error handling
 */
export interface ErrorHandlerOptions {
  /** Default message when no specific error message is found */
  defaultMessage?: string
  /** Whether to include field paths in error messages (e.g., "username: Invalid characters") */
  includeFieldPath?: boolean
  /** Maximum number of errors to return (useful for displaying limited errors) */
  maxErrors?: number
}

const DEFAULT_OPTIONS: Required<ErrorHandlerOptions> = {
  defaultMessage: 'Something went wrong. Please try again.',
  includeFieldPath: false,
  maxErrors: 10,
}

/**
 * Check if the error is a network error
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    return code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'NETWORK_ERROR'
  }
  return false
}

/**
 * Check if the error response is a Zod validation error
 */
function isZodError(response: ApiErrorResponse): boolean {
  return response.createdBy === 'ZodExceptionFilter' || response.createdBy === 'ZodError'
}

/**
 * Extract error message from a single error item
 */
function extractErrorMessage(error: ApiError | string, includeFieldPath: boolean): string {
  if (typeof error === 'string') {
    return error
  }

  const message = error.message || 'Invalid value'

  if (includeFieldPath && error.path) {
    const fieldPath = Array.isArray(error.path) ? error.path.join('.') : error.path
    if (fieldPath) {
      return `${fieldPath}: ${message}`
    }
  }

  return message
}

/**
 * Parse an API error response and extract meaningful error messages
 */
export function parseApiError(response: ApiErrorResponse, options?: ErrorHandlerOptions): ParsedError {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const errors: string[] = []
  let mainMessage = opts.defaultMessage

  // Extract errors array
  if (response.errors && Array.isArray(response.errors)) {
    const extractedErrors = response.errors
      .slice(0, opts.maxErrors)
      .map((err) => extractErrorMessage(err, opts.includeFieldPath))
      .filter(Boolean)

    errors.push(...extractedErrors)

    // Use first error as main message if available
    if (extractedErrors.length > 0) {
      mainMessage = extractedErrors[0]
    }
  }

  // Fall back to response message if no errors array
  if (errors.length === 0 && response.message) {
    mainMessage = response.message
    errors.push(response.message)
  }

  return {
    message: mainMessage,
    errors,
    isValidationError: isZodError(response),
    isNetworkError: false,
    rawError: response,
  }
}

/**
 * Parse any error (unknown type) and extract meaningful error messages
 */
export function parseError(error: unknown, options?: ErrorHandlerOptions): ParsedError {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Handle network errors
  if (isNetworkError(error)) {
    return {
      message: 'Network error. Please check your connection.',
      errors: ['Network error. Please check your connection.'],
      isValidationError: false,
      isNetworkError: true,
      rawError: error,
    }
  }

  // Handle API error response objects
  if (error && typeof error === 'object') {
    const errorObj = error as ApiErrorResponse

    // Check if it's an API response format
    if ('errors' in errorObj || 'message' in errorObj || 'createdBy' in errorObj) {
      return parseApiError(errorObj, opts)
    }

    // Handle axios-style errors with response.data
    if ('response' in errorObj) {
      const axiosError = errorObj as { response?: { data?: ApiErrorResponse } }
      if (axiosError.response?.data) {
        return parseApiError(axiosError.response.data, opts)
      }
    }

    // Handle Error instances
    if (error instanceof Error) {
      return {
        message: error.message || opts.defaultMessage,
        errors: [error.message || opts.defaultMessage],
        isValidationError: false,
        isNetworkError: false,
        rawError: error,
      }
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      errors: [error],
      isValidationError: false,
      isNetworkError: false,
      rawError: error,
    }
  }

  // Fallback for unknown error types
  return {
    message: opts.defaultMessage,
    errors: [opts.defaultMessage],
    isValidationError: false,
    isNetworkError: false,
    rawError: error,
  }
}

/**
 * Callback types for error handling
 */
export type ErrorDisplayCallback = (message: string) => void
export type MultiErrorDisplayCallback = (errors: string[]) => void
export type FullErrorCallback = (parsed: ParsedError) => void

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  /** Called with the primary error message */
  onError?: ErrorDisplayCallback
  /** Called with all error messages (for validation errors with multiple issues) */
  onErrors?: MultiErrorDisplayCallback
  /** Called with the full parsed error object for custom handling */
  onParsedError?: FullErrorCallback
  /** Options for parsing */
  options?: ErrorHandlerOptions
}

/**
 * Create a reusable error handler with configured callbacks
 *
 * @example
 * // With toast notifications
 * const handleError = createErrorHandler({
 *   onError: (message) => toast.error(message),
 * })
 *
 * // With multiple error display
 * const handleError = createErrorHandler({
 *   onErrors: (errors) => errors.forEach(err => toast.error(err)),
 *   options: { maxErrors: 3 }
 * })
 *
 * // With full control
 * const handleError = createErrorHandler({
 *   onParsedError: (parsed) => {
 *     if (parsed.isValidationError) {
 *       setFieldErrors(parsed.errors)
 *     } else {
 *       toast.error(parsed.message)
 *     }
 *   }
 * })
 *
 * // Usage
 * try {
 *   await api.createUser(data)
 * } catch (error) {
 *   handleError(error)
 * }
 */
export function createErrorHandler(config: ErrorHandlerConfig) {
  return (error: unknown): ParsedError => {
    const parsed = parseError(error, config.options)

    if (config.onParsedError) {
      config.onParsedError(parsed)
    }

    if (config.onErrors && parsed.errors.length > 0) {
      config.onErrors(parsed.errors)
    }

    if (config.onError) {
      config.onError(parsed.message)
    }

    return parsed
  }
}

/**
 * Simple utility to get the first error message from any error
 *
 * @example
 * const message = getErrorMessage(error)
 * toast.error(message)
 */
export function getErrorMessage(error: unknown, defaultMessage?: string): string {
  return parseError(error, { defaultMessage }).message
}

/**
 * Simple utility to get all error messages from any error
 *
 * @example
 * const messages = getErrorMessages(error)
 * messages.forEach(msg => toast.error(msg))
 */
export function getErrorMessages(error: unknown, options?: ErrorHandlerOptions): string[] {
  return parseError(error, options).errors
}
