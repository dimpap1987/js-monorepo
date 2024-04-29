import { validateAuthToken } from '@js-monorepo/auth-server'
import { NextRequest, NextResponse } from 'next/server'

export const publicRoutes = [
  '/',
  '/about',
  '/api/checkout_sessions',
  '/privacy-cookie-statement',
  '/terms-of-use',
]
export const authRoutes = ['/auth/login', '/auth/register', '/auth/onboarding']
export const apiAuthPrefix = '/api/auth'

export function withAuth(
  nextMiddleware: (
    request: NextRequest
  ) => Promise<NextResponse<unknown>> | NextResponse<unknown>
): (
  request: NextRequest
) => Promise<NextResponse<unknown>> | NextResponse<unknown> {
  return async function middleAuth(
    request: NextRequest
  ): Promise<NextResponse<unknown>> {
    const session = await validateAuthToken(process.env.JWT_SECRET_KEY ?? '')
    const isLoggedIn = !!session?.user
    const { nextUrl } = request

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)

    if (isApiAuthRoute || isPublicRoute) {
      return nextMiddleware(request)
    }

    if (isAuthRoute) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL('/', nextUrl))
      }
      return nextMiddleware(request)
    }

    if (!isLoggedIn && !isPublicRoute) {
      return NextResponse.redirect(new URL(`/auth/login`, nextUrl))
    }
    return nextMiddleware(request)
  }
}
