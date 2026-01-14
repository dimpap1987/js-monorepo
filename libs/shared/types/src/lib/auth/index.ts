import { NotificationDto } from '../notifications/index.js'

export type SessionUserType = {
  id: number
  username: string
  createdAt?: Date
  lastLoggedIn?: string
  isAdmin?: boolean
  status?: UserStatus
  profile: {
    id?: number
    image?: string | null
    provider?: string
  }
  roles: string[]
  email?: string
}

export const PROVIDERS_ARRAY = ['GITHUB', 'GOOGLE', 'FACEBOOK'] as const
export type ProviderName = (typeof PROVIDERS_ARRAY)[number]

export type AuthRole = 'ADMIN' | 'USER'

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  BANNED = 'BANNED',
}

export type ProvidersDto = {
  id: number
  profileImage?: string | null
}

export type UnRegisteredUserCreateDto = {
  email: string
  provider: ProviderName
  profileImage?: string | null
}

export type UnRegisteredUserDto = {
  id: number
  token: string
  email: string
  providerId: number
  profileImage?: string | null
  createdAt: Date
}

// Deprecated
export type AuthUserUpdateDto =
  | { username: string; roles?: { id: number }[] }
  | { username?: string; roles: { id: number }[] }

export type AuthUserFullDto = AuthUserDto & {
  sentNotifications?: NotificationDto[]
  receivedNotifications?: NotificationDto[]
}

export interface AuthUserDto {
  id: number
  createdAt: Date
  username: string
  email: string
  status?: UserStatus
  userProfiles: {
    id: number
    providerId: number
    provider?: {
      name: string
    }
    profileImage?: string | null
    firstName?: string | null
    lastName?: string | null
  }[]
  userRole: {
    role: {
      name: string
    }
  }[]
}

export interface AuthUserCreateDto {
  username: string
  email: string
}

export type AuthRoleDTO = {
  id: number
  name: string
}

export interface SessionObject {
  cookie: {
    originalMaxAge: number
    expires: string
    secure: boolean
    httpOnly: boolean
    path: string
    sameSite: string
  }
  passport: {
    user: number // Assuming user ID is a number
  }
}

export interface EditUserDto {
  username?: string
  profileImage?: string
  firstName?: string | null
  lastName?: string | null
}
