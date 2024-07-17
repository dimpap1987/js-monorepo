import { NextRequest, NextResponse } from 'next/server'

export function withCrf(
  nextMiddleware: (
    request: NextRequest
  ) => Promise<NextResponse<unknown>> | NextResponse<unknown>
): (
  request: NextRequest
) => Promise<NextResponse<unknown>> | NextResponse<unknown> {
  return async function middleWithCrf(
    request: NextRequest
  ): Promise<NextResponse<unknown>> {
    const csrfToken = request.cookies.get('XSRF-TOKEN')?.value

    if (csrfToken) {
      request.headers.set('X-XSRF-TOKEN', csrfToken)
    }
    return nextMiddleware(request)
  }
}
