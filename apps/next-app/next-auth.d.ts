import { NextMiddleware } from 'next/server'

export type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any
  export const ReactComponent: any
  export default content
}
