import { AuthUserDto } from '@js-monorepo/types'
import { RouteInfo } from '@nestjs/common/interfaces'
import { GithubAuth, GoogleAuth } from '../../common/types/auth.configuration'

export interface AuthConfiguration {
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
