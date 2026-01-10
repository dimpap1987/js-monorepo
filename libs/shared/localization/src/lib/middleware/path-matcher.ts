/**
 * Path matching utilities for middleware
 *
 * Follows Single Responsibility Principle - only handles path matching logic
 */

/**
 * Default paths to skip in middleware
 */
export const DEFAULT_SKIP_PATTERNS = {
  /** Next.js internal paths */
  nextInternal: /^\/_next/,
  /** API routes */
  api: /^\/api/,
  /** Favicon */
  favicon: /^\/favicon/,
  /** Static files (contains extension) */
  staticFiles: /\.[^/]+$/,
} as const

/**
 * Options for path matching
 */
export interface PathMatcherOptions {
  /** Patterns to skip (regex or string prefix) */
  skipPatterns?: (RegExp | string)[]
  /** Additional patterns to skip */
  additionalSkipPatterns?: (RegExp | string)[]
}

/**
 * Creates a path matcher function
 *
 * @example
 * const shouldProcess = createPathMatcher()
 * shouldProcess('/_next/static/chunk.js') // false
 * shouldProcess('/dashboard') // true
 */
export function createPathMatcher(options?: PathMatcherOptions): (pathname: string) => boolean {
  const defaultPatterns = Object.values(DEFAULT_SKIP_PATTERNS)
  const customPatterns = options?.skipPatterns ?? defaultPatterns
  const additionalPatterns = options?.additionalSkipPatterns ?? []

  const allPatterns = [...customPatterns, ...additionalPatterns]

  return (pathname: string): boolean => {
    for (const pattern of allPatterns) {
      if (typeof pattern === 'string') {
        if (pathname.startsWith(pattern)) {
          return false
        }
      } else if (pattern.test(pathname)) {
        return false
      }
    }
    return true
  }
}

/**
 * Checks if a path should be processed by locale middleware
 * Uses default skip patterns
 */
export function shouldProcessPath(pathname: string): boolean {
  return (
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/favicon') &&
    !pathname.includes('.')
  )
}
