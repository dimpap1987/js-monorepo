import { getCurrentUser } from '@next-app/actions/session'
import { NextRequest, NextResponse } from 'next/server'

const routes = [
  {
    path: '/about',
    roles: ['PUBLIC'],
  },
  {
    path: '/api/checkout_sessions',
    roles: ['PUBLIC'],
  },
  {
    path: '/privacy-cookie-statement',
    roles: ['PUBLIC'],
  },
  {
    path: '/terms-of-use',
    roles: ['PUBLIC'],
  },
  {
    path: '/profile',
    roles: ['USER', 'ADMIN'],
  },
  {
    path: '/dashboard',
    roles: ['ADMIN'],
  },
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
    const session = await getCurrentUser()
    const isLoggedIn = !!session?.user
    const { nextUrl } = request

    // initialize flags
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)

    const isPublicRoute =
      nextUrl.pathname === '/' ||
      routes
        .filter((route) => route.roles?.includes('PUBLIC'))
        .some((route) => nextUrl.pathname.startsWith(route.path))

    const isAuthRoute = authRoutes.includes(nextUrl.pathname)

    const routeExists = routes.some((route) =>
      nextUrl.pathname.startsWith(route.path)
    )

    // start the middleware logic
    if (isApiAuthRoute || isPublicRoute) {
      return nextMiddleware(request)
    }

    if (isAuthRoute) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL('/', nextUrl))
      }
      return nextMiddleware(request)
    }

    if (!isLoggedIn && !isPublicRoute && routeExists) {
      return NextResponse.redirect(new URL(`/auth/login`, nextUrl))
    }

    const hasRequiredRole = routes
      .find((route) => nextUrl.pathname.startsWith(route.path))
      ?.roles?.some((role) => session?.user?.roles?.includes(role))

    if (!hasRequiredRole && routeExists) {
      return NextResponse.redirect(new URL('/', nextUrl))
    }

    return nextMiddleware(request)
  }
}
