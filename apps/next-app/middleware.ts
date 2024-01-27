import { withError } from './app/middlewares/withError'
import { withAuth } from './app/middlewares/withAuth'
import { withPathName } from './app/middlewares/withPathName'
import { NextResponse } from 'next/server'

type MiddlewareWrapper<Middleware> = (
  wrappedMiddleware: Middleware
) => Middleware

export const compose = <Middleware>(
  firstMiddlewareWrapper: MiddlewareWrapper<Middleware>,
  ...otherMiddlewareWrappers: MiddlewareWrapper<Middleware>[]
): MiddlewareWrapper<Middleware> =>
  otherMiddlewareWrappers.reduce(
    (accumulatedMiddlewares, nextMiddleware) => (middleware) =>
      accumulatedMiddlewares(nextMiddleware(middleware)),
    firstMiddlewareWrapper
  )

const composedMiddlewares = compose(withPathName, withError, withAuth)

export const middleware = composedMiddlewares(() => {
  return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
