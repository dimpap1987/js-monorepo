import { NextResponse, type NextRequest } from 'next/server'
import type { LocalizationConfig, LocaleDetectionResult } from '../core/types'
import { createLocaleDetector, type LocaleDetectionRequest } from '../middleware/locale-detector'

/**
 * Creates a request adapter for Next.js requests
 */
export function createNextRequestAdapter(request: NextRequest): LocaleDetectionRequest {
  return {
    getCookie: (name: string) => request.cookies.get(name)?.value,
    getQueryParam: (name: string) => request.nextUrl.searchParams.get(name) ?? undefined,
    getHost: () => request.headers.get('host') ?? 'localhost',
  }
}

/**
 * Options for Next.js locale middleware
 */
export interface NextLocaleMiddlewareOptions {
  /** Cookie max age in seconds (default: 1 year) */
  cookieMaxAge?: number
  /** Cookie same site policy (default: 'lax') */
  cookieSameSite?: 'strict' | 'lax' | 'none'
}

/**
 * Creates a Next.js locale middleware handler
 *
 * This is a composable middleware that can be used standalone or chained with other middleware.
 * Returns a function that processes the request and returns a modified response.
 *
 * @example
 * const handleLocale = createNextLocaleMiddleware(config)
 *
 * export function middleware(request: NextRequest) {
 *   if (!shouldProcessPath(request.nextUrl.pathname)) {
 *     return NextResponse.next()
 *   }
 *   return handleLocale(request)
 * }
 */
export function createNextLocaleMiddleware<TLocale extends string>(
  config: LocalizationConfig<TLocale>,
  options?: NextLocaleMiddlewareOptions
): (request: NextRequest, baseResponse?: NextResponse) => NextResponse {
  const detectLocale = createLocaleDetector(config)
  const { cookieMaxAge = 60 * 60 * 24 * 365, cookieSameSite = 'lax' } = options ?? {}

  return (request: NextRequest, baseResponse?: NextResponse): NextResponse => {
    const adapter = createNextRequestAdapter(request)
    const result = detectLocale(adapter)

    // Create modified headers with locale
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set(config.headerName, result.locale)

    // Create response with modified request headers
    const response =
      baseResponse ??
      (NextResponse.next({
        request: { headers: requestHeaders },
      }) as NextResponse)

    // Persist locale to cookie if needed
    if (result.shouldPersist) {
      response.cookies.set(config.cookieName, result.locale, {
        path: '/',
        maxAge: cookieMaxAge,
        sameSite: cookieSameSite,
      })
    }

    return response
  }
}

/**
 * Extracts locale detection result without creating a response
 * Useful when you need to use the locale in custom middleware logic
 */
export function detectLocaleFromNextRequest<TLocale extends string>(
  request: NextRequest,
  config: LocalizationConfig<TLocale>
): LocaleDetectionResult<TLocale> {
  const adapter = createNextRequestAdapter(request)
  const detectLocale = createLocaleDetector(config)
  return detectLocale(adapter)
}

/**
 * Applies locale to a Next.js response
 * Useful when composing with other middleware
 */
export function applyLocaleToResponse<TLocale extends string>(
  response: NextResponse,
  result: LocaleDetectionResult<TLocale>,
  config: Pick<LocalizationConfig<TLocale>, 'cookieName'>,
  options?: NextLocaleMiddlewareOptions
): NextResponse {
  const { cookieMaxAge = 60 * 60 * 24 * 365, cookieSameSite = 'lax' } = options ?? {}

  if (result.shouldPersist) {
    response.cookies.set(config.cookieName, result.locale, {
      path: '/',
      maxAge: cookieMaxAge,
      sameSite: cookieSameSite,
    })
  }

  return response
}
