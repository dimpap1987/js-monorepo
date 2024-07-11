import { JwtPayload } from '@js-monorepo/types'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { Response } from 'express'
import { AuthException } from '../exceptions/api-exception'
import { RefreshTokenService } from './refreshToken.service'
import { TokensService } from './tokens.service'
import { UserService } from './user.service'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @Inject('DB_CLIENT') private readonly dbClient: PrismaClient,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly userService: UserService,
    private readonly tokensService: TokensService
  ) {}

  async handleTokenRotation(
    accessToken: string,
    refreshToken: string,
    userMetadata?: { ipAddress?: string; browserInfo?: string }
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      this.tokensService.verifyAcessToken(accessToken)
      return {
        accessToken,
        refreshToken,
      }
    } catch (e1) {
      // access token is invalid so create new one  - refresh token as well
      try {
        const { user: userRefreshToken } =
          this.tokensService.verifyRefreshToken(refreshToken) as JwtPayload

        const retrievedRefreshToken =
          await this.refreshTokenService.findRefreshToken(refreshToken)

        if (!retrievedRefreshToken || retrievedRefreshToken?.revoked) {
          this.logger.warn(
            `Token: '${retrievedRefreshToken}' for user has been revoked!`
          )
          this.refreshTokenService.revokeRefreshTokensOByUserId(
            userRefreshToken.id
          )
          throw new AuthException(
            HttpStatus.UNAUTHORIZED,
            `Refresh Token has been revoked'`,
            'UNAUTHORIZED'
          )
        }

        // create new tokens
        const user = await this.userService.findAuthUserById(
          userRefreshToken.id
        )
        const rotatedTokens = this.tokensService.createJwtTokens({
          user: user,
        })

        this.dbClient.$transaction(async (tr) => {
          // Invalidate the previous refresh token in the database
          await this.refreshTokenService.revokeRefreshTokenById(
            retrievedRefreshToken.id,
            tr
          )
          // save the new refresh token in the DB
          await this.refreshTokenService.storeRefreshTokenInDb(
            {
              user_id: user.id,
              token: rotatedTokens.refreshToken,
              user_agent: userMetadata?.browserInfo,
              ip_address: userMetadata?.ipAddress,
            },
            tr
          )
        })

        return rotatedTokens
      } catch (e2) {
        if (e2 instanceof AuthException) {
          throw e2
        } else {
          this.logger.error(
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

  async persistRefreshToken(
    refreshToken: string,
    userMetada?: { ipAddress?: string; userAgent?: string }
  ) {
    try {
      const payload = this.tokensService.decode(refreshToken) as JwtPayload
      await this.refreshTokenService.storeRefreshTokenInDb({
        token: refreshToken,
        user_id: payload.user.id,
        user_agent: userMetada?.userAgent,
        ip_address: userMetada?.ipAddress,
      })
    } catch (e) {
      this.logger.error('Error in persisting the refresh Token', e)
    }
  }

  async revokeRefreshToken(refreshToken: string) {
    this.refreshTokenService.revokeRefreshTokenByToken(refreshToken)
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
