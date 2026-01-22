import { NextRequest, NextResponse } from 'next/server'

export function createWithPathname() {
  return function withPathname(nextMiddleware: (request: NextRequest) => Promise<NextResponse> | NextResponse) {
    return async function middlewarePathname(request: NextRequest): Promise<NextResponse> {
      const pathname = request.nextUrl.pathname

      const response = await nextMiddleware(request)

      if (!response.headers.has('x-pathname')) {
        response.headers.set('x-pathname', pathname)
      }
      return response
    }
  }
}
