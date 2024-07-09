import { AuthUser, PrismaClient } from '@prisma/client'
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
  dbClient: PrismaClient
  jwtSercret: string
  redirectUiUrl?: string
  github?: GithubAuth
  google?: GoogleAuth
  onRegister?: (user: AuthUser) => Promise<any>
  onLogin?: (user: AuthUser) => Promise<any>
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
