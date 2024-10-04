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
