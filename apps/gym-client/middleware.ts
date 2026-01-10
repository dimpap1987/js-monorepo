import { NextRequest, NextResponse } from 'next/server'
import { shouldProcessPath, createNextLocaleMiddleware } from '@js-monorepo/localization'
import { localizationConfig } from './i18n/config'

/**
 * Locale middleware handler
 * Uses the localization library for domain-based locale detection
 */
const handleLocale = createNextLocaleMiddleware(localizationConfig)

/**
 * Main middleware function
 *
 * Current handlers:
 * 1. Locale detection (domain-based routing)
 *
 * Future handlers (add as needed):
 * - Authentication
 * - Rate limiting
 * - Feature flags
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and API routes
  if (!shouldProcessPath(pathname)) {
    return NextResponse.next()
  }

  // Apply locale middleware
  return handleLocale(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
