import { getCurrentUser } from '@next-app/actions/session'
import { NextRequest, NextResponse } from 'next/server'
import { apiAuthPrefix, authRoutes, routes } from './routes'

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

    const session = await getCurrentUser()
    const isLoggedIn = !!session?.user

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
