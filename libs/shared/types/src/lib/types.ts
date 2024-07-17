import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

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

export type RefreshTokenPayload = Partial<
  Omit<
    Prisma.RefreshTokenGetPayload<{
      include: {
        user: false
      }
    }>,
    'token' | 'user_id'
  >
> &
  Required<
    Pick<
      Prisma.RefreshTokenGetPayload<{
        include: {
          user: false
        }
      }>,
      'token' | 'user_id'
    >
  >

export type MenuItem = {
  name: string
  href: string
  Icon?: any
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

export type PrismaTransactionType = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>
