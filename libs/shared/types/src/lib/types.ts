import { Prisma } from '@prisma/client'

export interface UserJWT {
  username: string
  createdAt?: string | Date
  lastLoggedIn?: string | null
  picture?: string | null
  provider?: string | null
  roles?: string[]
}

export interface JwtPayload {
  user: UserJWT
}

export type ClientResponseType =
  | {
      ok: true
      data?: any
    }
  | {
      ok: false
      message?: string
      errors?: string[]
    }

export type AuthUserWithProviders = Prisma.AuthUserGetPayload<{
  include: {
    providers: true
  }
}>
