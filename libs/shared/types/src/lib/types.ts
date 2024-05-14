import { IconType } from 'react-icons/lib'
import { Prisma } from '@prisma/client'

export interface UserJWT {
  id: string | number
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

export type MenuItem = {
  name: string
  href: string
  Icon?: IconType
  roles: ('ADMIN' | 'USER' | 'PUBLIC')[]
}

export type AuthUserFullPayload = Prisma.AuthUserGetPayload<{
  include: {
    providers: true
    receivedNotifications: true
    sentNotifications: true
    userChannels: true
  }
}>
