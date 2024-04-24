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

export interface PostgresConfig {
  username: string
  password: string
  url: string
}

export interface AuthConfiguration {
  sessionSecret: string
  jwtSercret: string
  redirectUiUrl?: string
  postgres?: PostgresConfig
  github?: GithubAuth
  google?: GoogleAuth
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
