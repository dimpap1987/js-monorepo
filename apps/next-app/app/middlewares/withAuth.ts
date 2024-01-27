import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../auth'

export const publicRoutes = ['/', '/about']
export const authRoutes = ['/auth/login', '/auth/register']
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
    const session = await auth()

    const isLoggedIn = !!session
    const { nextUrl } = request

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)

    if (isApiAuthRoute) {
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
