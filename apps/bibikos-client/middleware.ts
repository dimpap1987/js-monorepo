import { compose } from '@js-monorepo/next/middlewares'
import { NextResponse } from 'next/server'
import { withAuth } from './middlewares/withAuth'
import { withLocale } from './middlewares/withLocale'

const composedMiddlewares = compose(withLocale, withAuth)

export const middleware = composedMiddlewares(() => {
  return NextResponse.next()
})

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
