import NextAuth, { type DefaultSession } from 'next-auth'

import { NextMiddleware } from 'next/server'

export type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware

export enum UserRole {
  ADMIN,
  USER,
}

export type ExtendedUser =
  | (DefaultSession['user'] & {
      roles: UserRole[]
      createdAt?: string
    })
  | undefined

export type ExtendedJWT = DefaultJWT & {
  roles: UserRole[]
  createdAt?: string
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
