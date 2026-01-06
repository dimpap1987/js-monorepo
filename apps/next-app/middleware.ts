import { compose, withCSP, withPathName } from '@js-monorepo/next/middlewares'
import { NextResponse } from 'next/server'
import { withAuth } from './app/middlewares/withAuth'

const composedMiddlewares = compose(withPathName, withAuth)
// TODO: add withCSP

export const middleware = composedMiddlewares(() => {
  return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    {
      source: '/((?!.+\\.[\\w]+$|_next).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    {
      source: '/',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    {
      source: '/(api|trpc)(.*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
