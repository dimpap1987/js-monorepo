import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

export interface UserJWT {
  id: number
  username: string
  createdAt?: string | Date
  lastLoggedIn?: string | null
  picture?: string | null
  provider?: string | null
  roles?: AuthRoles[]
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

export type ProviderName = 'github' | 'google'

export type AuthRoles = 'ADMIN' | 'USER'

export type ProviderDto = {
  id: number
  profileImage: string | null
  type: ProviderName
}

export type AuthUserWithProvidersDto = {
  id: number
  username: string
  roles: AuthRoles[]
  createdAt: string | Date
  providers: ProviderDto[]
}

export type AuthUserCreateDto = {
  email: string
  username: string
}

export type AuthUserDto = {
  id: number
  username: string
  roles: AuthRoles[]
  createdAt: string | Date
}

export type ProvidersDto = {
  type: ProviderName
  profileImage: string | null
}

export type UnRegisteredUserCreateDto = {
  email: string
  provider: ProviderName
  profileImage: string
}

export type UnRegisteredUserDto = {
  id: number
  token: string
  email: string
  provider: ProviderName
  profileImage: string | null
  createdAt: Date
}

export type RefreshTokenCreateDto = {
  user_id: number
  token: string
  ip_address?: string | null
  user_agent?: string | null
}

export type RefreshTokenDto = {
  id: number
  revoked: boolean
}
