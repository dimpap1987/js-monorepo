import { auth } from '@next-app/auth'
import { NextRequest, NextResponse } from 'next/server'

export const publicRoutes = ['/', '/about', '/api/checkout_sessions']
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
    const session = await auth.getCurrentSession()

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
