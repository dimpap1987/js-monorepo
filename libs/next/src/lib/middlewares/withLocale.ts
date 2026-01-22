import {
  applyLocaleToResponse,
  detectLocaleFromNextRequest,
  LocalizationConfig,
  shouldProcessPath,
} from '@js-monorepo/localization'
import { NextRequest, NextResponse } from 'next/server'

export function createWithLocale(config: LocalizationConfig) {
  return function withLocale(
    nextMiddleware: (request: NextRequest) => Promise<NextResponse<unknown>> | NextResponse<unknown>
  ): (request: NextRequest) => Promise<NextResponse<unknown>> | NextResponse<unknown> {
    return async function middlewareLocale(request: NextRequest): Promise<NextResponse<unknown>> {
      const { pathname } = request.nextUrl

      // Skip static files and API routes
      if (!shouldProcessPath(pathname)) {
        return nextMiddleware(request)
      }

      // Detect locale from request (query param, cookie, or domain)
      const localeResult = detectLocaleFromNextRequest(request, config)

      // Get response from next middleware (might be a redirect from withAuth)
      const response = await nextMiddleware(request)

      // If it's a redirect, just apply locale cookie and return
      if (response.headers.get('location')) {
        applyLocaleToResponse(response, localeResult, config)
        return response
      }

      // For non-redirect responses, create new response with locale header
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set(config.headerName, localeResult.locale)

      const localeResponse = NextResponse.next({
        request: { headers: requestHeaders },
      })

      // Copy cookies from original response (e.g., from other middleware)
      response.cookies.getAll().forEach((cookie) => {
        localeResponse.cookies.set(cookie.name, cookie.value)
      })

      // Apply locale cookie if detection source changed (e.g., from query param)
      applyLocaleToResponse(localeResponse, localeResult, config)

      return localeResponse
    }
  }
}
