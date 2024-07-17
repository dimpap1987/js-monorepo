import { NextResponse } from 'next/server'
import { withAuth } from './app/middlewares/withAuth'
import { compose, withPathName } from '@js-monorepo/nest-utils'

const composedMiddlewares = compose(withPathName, withAuth)

export const middleware = composedMiddlewares(() => {
  return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
