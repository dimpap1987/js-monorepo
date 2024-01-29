import { NextRequest, NextResponse } from 'next/server'

export function withError(
  nextMiddleware: (
    request: NextRequest
  ) => Promise<NextResponse<unknown>> | NextResponse<unknown>
): (
  request: NextRequest
) => Promise<NextResponse<unknown>> | NextResponse<unknown> {
  return async function middleWithError(
    request: NextRequest
  ): Promise<NextResponse<unknown>> {
    const errorCode = request.nextUrl.searchParams.get('error')
    if (errorCode === 'AuthorizedCallbackError') {
      return NextResponse.redirect(new URL('/auth/register', request.url))
    }
    return nextMiddleware(request)
  }
}
