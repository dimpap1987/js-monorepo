import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { NextRequest, NextResponse } from 'next/server'

const ONBOARDING_REQUIRED_ROUTES = ['/dashboard']

export function withOnboarding(
  nextMiddleware: (request: NextRequest) => Promise<NextResponse<unknown>> | NextResponse<unknown>
): (request: NextRequest) => Promise<NextResponse<unknown>> | NextResponse<unknown> {
  return async function middlewareOnboarding(request: NextRequest): Promise<NextResponse<unknown>> {
    const { pathname } = request.nextUrl

    const requiresOnboarding = ONBOARDING_REQUIRED_ROUTES.some((route) => pathname.startsWith(route))

    if (!requiresOnboarding) {
      return nextMiddleware(request)
    }

    const session = await getCurrentSession()

    // If no session, let withAuth handle the redirect to login
    if (!session?.user) {
      return nextMiddleware(request)
    }

    const hasOrganizerProfile = session.appUser?.hasOrganizerProfile === true

    if (!hasOrganizerProfile) {
      return NextResponse.redirect(new URL('/onboarding', request.nextUrl))
    }

    return nextMiddleware(request)
  }
}
