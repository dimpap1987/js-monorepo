import NextAuth, { type DefaultSession } from 'next-auth'

export type UserRole = 'admin' | 'user'

export type ExtendedUser =
  | (DefaultSession['user'] & {
      role: UserRole
    })
  | undefined

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}