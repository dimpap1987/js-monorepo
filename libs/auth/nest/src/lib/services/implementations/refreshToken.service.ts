import { RefreshTokenCreateDto, RefreshTokenDto } from '@js-monorepo/types'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { JwtPayload } from 'jsonwebtoken'
import { AuthException } from '../../exceptions/api-exception'
import { RefreshTokenRepository } from '../../repositories/refreshToken.repository'
import { AuthService } from '../interfaces/auth.service'
import { RefreshTokenService } from '../interfaces/refreshToken.service'
import { TokensService } from '../tokens.service'

@Injectable()
export class RefreshTokenServiceImpl implements RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenServiceImpl.name)

  constructor(
    @Inject('REFRESH_TOKEN_REPOSITORY')
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokensService: TokensService,
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthService
  ) {}

  async revokeRefreshTokenById(tokenId: number): Promise<void> {
    try {
      this.logger.debug(`Revoking refresh token with id: ${tokenId}`)
      await this.refreshTokenRepository.revokeRefreshTokenById(tokenId)
    } catch (e: any) {
      this.logger.error(
        `Error Revoking refresh token with id: ${tokenId}`,
        e.stack
      )
    }
  }

  async revokeRefreshTokensByUserId(userId: number): Promise<void> {
    try {
      this.logger.debug(`Revoking refresh tokens of user with id: ${userId}`)
      await this.refreshTokenRepository.revokeRefreshTokensByUserId(userId)
    } catch (e: any) {
      this.logger.error(
        `Error Revoking refresh tokens of user with id: ${userId}`,
        e.stack
      )
    }
  }

  async revokeRefreshTokenByToken(token: string): Promise<void> {
    try {
      this.logger.debug(`Revoking refresh token`)
      await this.refreshTokenRepository.revokeRefreshTokenByToken(token)
    } catch (e: any) {
      this.logger.error('Revoking refresh token`', e.stack)
    }
  }

  async findRefreshToken(token: string): Promise<RefreshTokenDto | null> {
    try {
      this.logger.debug(`Retrieving refresh token`)
      return await this.refreshTokenRepository.findRefreshToken(token)
    } catch (e: any) {
      this.logger.error(`Error Retrieving refresh token: ${token}`, e.stack)
    }
    return null
  }

  async storeRefreshToken(
    payload: RefreshTokenCreateDto
  ): Promise<RefreshTokenDto | null> {
    try {
      this.logger.debug(`Creating refresh token for user: ${payload.userId}`)
      return await this.refreshTokenRepository.storeRefreshToken(payload)
    } catch (e: any) {
      this.logger.error(
        `Error Creating refresh token for user: ${payload.userId}`,
        e.stack
      )
      return null
    }
  }

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

        const retrievedRefreshToken = await this.findRefreshToken(refreshToken)

        if (!retrievedRefreshToken || retrievedRefreshToken?.revoked) {
          this.logger.warn(
            `Refresh Token: '${retrievedRefreshToken?.id}' for user has been revoked!`
          )
          await this.revokeRefreshTokensByUserId(userRefreshToken.id)
          throw new AuthException(
            HttpStatus.UNAUTHORIZED,
            `Refresh Token has been revoked'`,
            'UNAUTHORIZED'
          )
        }

        // create new tokens
        const user = await this.authService.findAuthUserById(
          userRefreshToken.id
        )
        const rotatedTokens = this.tokensService.createJwtTokens({
          user: {
            id: user.id,
            username: user.username,
            roles: user.roles,
            createdAt: user.createdAt,
            picture: user.providers[0]?.profileImage,
          },
        })

        //TODO the below in a trasaction scope
        await this.revokeRefreshTokenById(retrievedRefreshToken.id)
        await this.storeRefreshToken({
          userId: user.id,
          token: rotatedTokens.refreshToken,
          userAgent: userMetadata?.browserInfo,
          ipAddress: userMetadata?.ipAddress,
        })

        return rotatedTokens
      } catch (e2: any) {
        if (e2 instanceof AuthException) {
          throw e2
        } else {
          this.logger.error(
            `Unexpected Error when handling refresh token rotation for refreshToken: '${refreshToken}'`,
            e2.stack
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
