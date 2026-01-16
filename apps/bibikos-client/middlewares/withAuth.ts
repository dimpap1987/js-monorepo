import { buildLoginUrl } from '@js-monorepo/auth/next/client'
import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiAuthPrefix, authRoutes, getRouteConfig, isPublicRoute } from '../lib/routes-config'
import { hasAnyRequiredRole } from '../lib/roles'

export function withAuth(
  nextMiddleware: (request: NextRequest) => Promise<NextResponse<unknown>> | NextResponse<unknown>
): (request: NextRequest) => Promise<NextResponse<unknown>> | NextResponse<unknown> {
  return async function middleAuth(request: NextRequest): Promise<NextResponse<unknown>> {
    const { nextUrl } = request
    const { pathname } = nextUrl

    // Skip API auth routes and public routes
    if (pathname.startsWith(apiAuthPrefix) || isPublicRoute(pathname)) {
      return nextMiddleware(request)
    }

    const session = await getCurrentSession()
    const isLoggedIn = !!session?.user

    // Auth routes (login, register, onboarding) - redirect logged-in users to home
    if (authRoutes.includes(pathname)) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL('/', nextUrl))
      }
      return nextMiddleware(request)
    }

    const routeConfig = getRouteConfig(pathname)

    // Protected route requires authentication
    if (!isLoggedIn && routeConfig) {
      const callbackPath = pathname + nextUrl.search
      return NextResponse.redirect(new URL(buildLoginUrl(callbackPath), nextUrl))
    }

    // Check role-based access with hierarchy support
    if (routeConfig) {
      const userRoles = session?.user?.roles ?? []
      const hasAccess = hasAnyRequiredRole(userRoles, routeConfig.roles)

      if (!hasAccess) {
        return NextResponse.redirect(new URL('/', nextUrl))
      }
    }

    return nextMiddleware(request)
  }
}
