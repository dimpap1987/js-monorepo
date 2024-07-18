import { AuthUserDto } from '@js-monorepo/types'
import { Request, Response } from 'express'

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

export interface AuthConfiguration {
  sessionSecret: string
  csrfEnabled?: boolean
  accessTokenSecret: string
  refreshTokenSecret: string
  redirectUiUrl?: string
  github?: GithubAuth
  google?: GoogleAuth
  onRegister?: (user: AuthUserDto) => Promise<any>
  onLogin?: (user: AuthUserDto) => Promise<any>
}

declare module 'express' {
  export interface Request {
    session: any // Adjust the type of `session` as needed
  }
}

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
