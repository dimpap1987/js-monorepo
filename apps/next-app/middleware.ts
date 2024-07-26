import { compose, withPathName } from '@js-monorepo/next-client'
import { NextResponse } from 'next/server'
import { withAuth } from './app/middlewares/withAuth'

const composedMiddlewares = compose(withPathName, withAuth)

export const middleware = composedMiddlewares(() => {
  return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
