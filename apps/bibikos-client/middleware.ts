import { compose, createWithLocale, createWithPathname } from '@js-monorepo/next/middlewares'
import { NextResponse } from 'next/server'
import { localizationConfig } from './i18n/config'
import { withAuth } from './middlewares/withAuth'
import { withOnboarding } from './middlewares/withOnboarding'

const withLocale = createWithLocale(localizationConfig)
const withPathname = createWithPathname()
const composedMiddlewares = compose(withPathname, withLocale, withAuth, withOnboarding)

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
