import { generateNonce, removePathNameFromUrl } from '@js-monorepo/utils/common'
import { NextRequest, NextResponse } from 'next/server'

const isDev = process.env.NODE_ENV === 'development'
const websocketUrl = removePathNameFromUrl(process.env.NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL ?? '')
const apiUrl = removePathNameFromUrl(process.env.NEXT_PUBLIC_AUTH_URL ?? '')

export function withCSP(
  nextMiddleware: (request: NextRequest) => Promise<NextResponse> | NextResponse
): (request: NextRequest) => Promise<NextResponse> | NextResponse {
  return async function middlewareCSP(request: NextRequest): Promise<NextResponse> {
    const nonce = generateNonce()
    const cspHeader = `
    default-src 'self';
    script-src 'self' https://js.stripe.com ${isDev ? "'unsafe-eval' 'unsafe-inline'" : `'nonce-${nonce}'`};
    style-src 'self' 'unsafe-inline';
    connect-src 'self' https://ipapi.co ${websocketUrl} ${apiUrl};
    frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
    img-src 'self' blob: data: *.stadiamaps.com *.tile.stadiamaps.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`
      .replace(/\s{2,}/g, ' ')
      .trim()

    // Attach nonce to request for downstream use if needed
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)

    const response = await nextMiddleware(new NextRequest(request, { headers: requestHeaders }))

    response.headers.set('Content-Security-Policy', cspHeader)
    return response
  }
}
