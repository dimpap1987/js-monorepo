import { NextRequest, NextResponse } from 'next/server'

export function withPathName(
  nextMiddleware: (
    request: NextRequest
  ) => Promise<NextResponse<unknown>> | NextResponse<unknown>
): (
  request: NextRequest
) => Promise<NextResponse<unknown>> | NextResponse<unknown> {
  return async function middlewarePathName(
    request: NextRequest
  ): Promise<NextResponse<unknown>> {
    request.headers.append('x-pathname', request.nextUrl.pathname)
    return nextMiddleware(request)
  }
}
