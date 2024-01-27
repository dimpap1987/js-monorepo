import NextAuth, { type DefaultSession } from 'next-auth'

import { NextMiddleware } from 'next/server'

export type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware

export type UserRole = 'admin' | 'user'

export type ExtendedUser =
  | (DefaultSession['user'] & {
      roles: UserRole[]
      error?: string
    })
  | undefined

export type ExtendedJWT = DefaultJWT & {
  roles: UserRole[] // Adjust the type based on the actual structure of your roles
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}

declare module '@auth/core/jwt' {
  interface JWT extends Record<string, unknown>, DefaultJWT {
    roles: UserRole[]
  }
}
