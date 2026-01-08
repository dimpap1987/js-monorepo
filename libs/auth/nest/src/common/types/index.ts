/// <reference types="express-session" />

import { AuthUserDto, SessionUserType } from '@js-monorepo/types/auth'
import { RouteInfo } from '@nestjs/common/interfaces'

export interface GoogleAuth {
  clientId: string
  clientSecret: string
  callBackUrl?: string
}
export interface GithubAuth {
  clientId: string
  clientSecret: string
  callBackUrl?: string
}

export interface JWTConfiguration {
  csrf?: {
    enabled: boolean
    middlewareExclusions?: (string | RouteInfo)[]
  }
  tokenRoation?: {
    enabled: boolean
    middlewareExclusions?: (string | RouteInfo)[]
  }
  accessTokenSecret: string
  refreshTokenSecret: string
  redirectUiUrl?: string
  github?: GithubAuth
  google?: GoogleAuth
  onRegister?: (user: AuthUserDto) => Promise<any>
  onLogin?: (user: AuthUserDto) => Promise<any>
}

export interface SessionConfiguration {
  github?: GithubAuth
  google?: GoogleAuth
  csrf?: {
    enabled: boolean
    middlewareExclusions?: (string | RouteInfo)[]
  }
  redirectUiUrl?: string
  onRegister?: (user: AuthUserDto) => Promise<any>
  onLogin?: (user: AuthUserDto) => Promise<any>
}

declare module 'express-session' {
  export interface SessionData {
    user: SessionUserType
    callbackUrl?: string
  }
}

declare module 'express' {
  interface Request {
    user?: {
      user?: any
      unRegisteredUser?: any
    }
  }
}

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export const AuthConfig = Symbol('AUTH_CONFIG')
export const AuthOpts = Symbol('AUTH_OPTIONS')
export const ServiceAuth = Symbol('AUTH_SERVICE')
export const RepoAuth = Symbol('AUTH_REPOSITORY')
export const ServiceUnRegisteredUser = Symbol('UNREGISTERED_USER_SERVICE')
export const RepoUnRegisteredUser = Symbol('UNREGISTERED_USER_REPOSITORY')
export const RepoUserProfile = Symbol('PROFILE_USER_REPOSITORY')
export const ServiceUserProfile = Symbol('PROFILE_USER_SERVICE')
export const ServiceRole = Symbol('ROLE_SERVICE')
export const RedisSessionKey = Symbol('REDIS_SESSION_KEY')
export const RedisUserSessionKey = Symbol('REDIS_USER_SESSION_KEY')
export const RedisOnlineUsersKey = Symbol('REDIS_ONLINE_USERS_KEY')
export const RedisSocketUserKey = Symbol('REDIS_SOCKET_USER_KEY')
export const RedisPushSubscriptionsKey = Symbol('REDIS_PUSH_SUBSCRIPTIONS_KEY')
