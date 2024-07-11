import { JwtPayload } from '@js-monorepo/types'
import { JwtError, decode, sign, verify } from '@js-monorepo/utils'
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'
import { AuthException } from '../exceptions/api-exception'
import { RefreshTokenService } from './refreshToken.service'
import { UserService } from './user.service'

@Injectable()
export class AuthService {
  constructor(
    @Inject('JWT_SECRET') private readonly jwtSecret: string,
    private readonly refreshTokenService: RefreshTokenService,
    private userService: UserService
  ) {}

  createJwtTokens(payload: JwtPayload) {
    try {
      const accessToken = this.createAccessToken(payload)
      const refreshToken = this.createRefreshToken(payload)
      return {
        accessToken,
        refreshToken,
      }
    } catch (e) {
      throw new HttpException('CREATE_TOKEN', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  createAccessToken(payload: any) {
    return sign(payload, '5min', this.jwtSecret) // 5 minutes
  }

  createRefreshToken(payload: JwtPayload) {
    return sign(payload, '6h', this.jwtSecret) // 6 hours
  }

  verify(token: any) {
    try {
      return verify(token, this.jwtSecret) as JwtPayload
    } catch (e) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
    }
  }

  handleSessionRequest(bearerToken: string) {
    const { user } = this.verify(bearerToken)
    return {
      user,
    }
  }

  decode(token: any) {
    return decode(token) as JwtPayload
  }

  async handleTokenRotation(
    accessToken: string,
    refreshToken: string,
    userMetadata?: { ipAddress?: string; browserInfo?: string }
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      verify(accessToken, this.jwtSecret)
      return {
        accessToken,
        refreshToken,
      }
    } catch (e1) {
      // access token is invalid so create new one  - refresh token as well
      if (e1 instanceof JwtError) {
        try {
          const payload = verify(refreshToken, this.jwtSecret) as JwtPayload

          const retrievedRefreshToken =
            await this.refreshTokenService.findRefreshToken(refreshToken)

          if (!retrievedRefreshToken || retrievedRefreshToken?.revoked) {
            Logger.warn(
              `Token: '${retrievedRefreshToken}' for user has been revoked!`
            )
            this.refreshTokenService.revokeRefreshTokensOfUser(payload.user.id)
            throw new AuthException(
              HttpStatus.UNAUTHORIZED,
              `Refresh Token has been revoked'`,
              'UNAUTHORIZED'
            )
          }

          // create new tokens
          const user = await this.userService.findAuthUserById(payload.user.id)
          const rotatedTokens = this.createJwtTokens({ user: user })

          // Invalidate the previous refresh token in the database
          this.refreshTokenService.revokeRefreshTokenOfUser(
            retrievedRefreshToken.id
          )

          // save the new refresh token in the DB
          this.refreshTokenService.createRefreshToken({
            user_id: payload.user.id,
            token: rotatedTokens.refreshToken,
            user_agent: userMetadata?.browserInfo,
            ip_address: userMetadata?.ipAddress,
          })

          return rotatedTokens
        } catch (e2) {
          if (e2 instanceof AuthException) {
            throw e2
          } else if (e2 instanceof JwtError) {
            Logger.error(`Refresh Token is invalid`, e2)
          } else {
            Logger.error(
              `Error when handling refresh token rotation for refreshToken: '${refreshToken}'`,
              e2
            )
          }
        }
      }
      throw new AuthException(
        HttpStatus.UNAUTHORIZED,
        `User is not authorized'`,
        'UNAUTHORIZED'
      )
    }
  }

  async persistRefreshToken(
    refreshToken: string,
    userMetada?: { ipAddress?: string; userAgent?: string }
  ) {
    try {
      const payload = this.decode(refreshToken) as JwtPayload
      await this.refreshTokenService.createRefreshToken({
        token: refreshToken,
        user_id: payload.user.id,
        user_agent: userMetada?.userAgent,
        ip_address: userMetada?.ipAddress,
      })
    } catch (e) {
      Logger.error('Error in persisting the refresh Token')
    }
  }

  async revokeRefreshToken(refreshToken: string) {
    this.refreshTokenService.revokeRefreshTokensOfUserByToken(refreshToken)
  }

  setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.AUTH_COOKIE_DOMAIN_PROD
          : 'localhost',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.AUTH_COOKIE_DOMAIN_PROD
          : 'localhost',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
  }
}
