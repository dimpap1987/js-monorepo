import { AuthUserDto, SessionUserType } from '@js-monorepo/types'
import { RouteInfo } from '@nestjs/common/interfaces'
import session from 'express-session'

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
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      user?: any
      unRegisteredUser: any
    }
  }
}

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
