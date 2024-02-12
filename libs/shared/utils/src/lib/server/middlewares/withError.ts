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
    console.log(errorCode)
    return nextMiddleware(request)
  }
}
