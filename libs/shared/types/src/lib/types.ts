import { Prisma } from '@prisma/client'
import { IconType } from 'react-icons/lib'

export interface UserJWT {
  id: number
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

export type SuccessResponse<T> = {
  ok: true
  data?: T
  message?: string
  httpStatusCode: number
}

export type ErrorResponse = {
  ok: false
  message?: string
  errors?: string[]
  httpStatusCode: number
}

export type ClientResponseType<T> = SuccessResponse<T> | ErrorResponse

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

export interface CreateCheckoutSessionRequestBody {
  username: string
  price: number
  paymentName?: string
  paymentDescription?: string
  customSubmitMessage?: string
  isDonate?: boolean
}
