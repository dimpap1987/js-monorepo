import { NextRequest, NextResponse } from 'next/server'
import { getLocaleFromDomain, isValidLocale, LOCALE_COOKIE, type Locale } from './i18n/config'

/**
 * Middleware for domain-based locale routing
 *
 * Locale detection priority:
 * 1. Query param (?locale=el) - dev only, persists to cookie
 * 2. Cookie (NEXT_LOCALE) - persisted preference
 * 3. Domain-based detection (fitgym.com -> en, fitgym.gr -> el)
 *
 * Works with:
 * - Production: fitgym.com, fitgym.gr
 * - Local testing: fitgym.gr:4200 (via /etc/hosts)
 * - Development: localhost:4200?locale=el
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const host = request.headers.get('host') ?? 'localhost'
  const isDev = process.env.NODE_ENV === 'development'

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  let locale: Locale
  let shouldSetCookie = false

  // 1. Check query param (dev override)
  const queryLocale = searchParams.get('locale')
  if (isDev && queryLocale && isValidLocale(queryLocale)) {
    locale = queryLocale
    shouldSetCookie = true
  }
  // 2. Check cookie (persisted preference)
  else if (isDev) {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
    if (cookieLocale && isValidLocale(cookieLocale)) {
      locale = cookieLocale
    } else {
      // 3. Domain-based detection
      locale = getLocaleFromDomain(host)
    }
  } else {
    // Production: domain-based only
    locale = getLocaleFromDomain(host)
  }

  // Set locale header for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Persist locale choice via cookie
  if (shouldSetCookie) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
