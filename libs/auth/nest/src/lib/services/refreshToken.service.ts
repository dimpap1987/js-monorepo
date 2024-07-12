import { PrismaTransactionType, RefreshTokenPayload } from '@js-monorepo/types'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name)

  constructor(@Inject('DB_CLIENT') private readonly dbClient: PrismaClient) {}

  async storeRefreshTokenInDb(
    payload: RefreshTokenPayload,
    client: PrismaClient | PrismaTransactionType = this.dbClient
  ) {
    try {
      this.logger.debug(`Creating refresh token for user: ${payload.user_id}`)
      return await client.refreshToken.create({
        data: {
          ...payload,
        },
      })
    } catch (e) {
      this.logger.error(
        `Error Creating refresh token for user: ${payload.user_id}`,
        e
      )
      return null
    }
  }

  async revokeRefreshTokenById(
    tokenId: number,
    client: PrismaClient | PrismaTransactionType = this.dbClient
  ) {
    try {
      this.logger.debug(`Revoking refresh token with id: ${tokenId}`)
      await client.refreshToken.update({
        where: {
          id: tokenId,
        },
        data: {
          revoked: true,
        },
      })
    } catch (e) {
      this.logger.error(`Error Revoking refresh token with id: ${tokenId}`, e)
    }
  }

  async revokeRefreshTokensOByUserId(
    userId: number,
    client: PrismaClient | PrismaTransactionType = this.dbClient
  ) {
    try {
      this.logger.debug(`Revoking refresh tokens of user with id: ${userId}`)
      await client.refreshToken.updateMany({
        where: {
          user_id: userId,
        },
        data: {
          revoked: true,
        },
      })
    } catch (e) {
      this.logger.error(
        `Error Revoking refresh tokens of user with id: ${userId}`
      )
    }
  }

  async revokeRefreshTokenByToken(
    token: string,
    client: PrismaClient | PrismaTransactionType = this.dbClient
  ) {
    try {
      this.logger.debug(`Revoking refresh token`)
      await client.refreshToken.update({
        where: {
          token: token,
        },
        data: {
          revoked: true,
        },
      })
    } catch (e) {
      this.logger.error('Revoking refresh token`', e)
    }
  }

  async findRefreshToken(
    token: string,
    client: PrismaClient | PrismaTransactionType = this.dbClient
  ) {
    try {
      this.logger.debug(`Retrieving refresh token`)
      return await client.refreshToken.findUniqueOrThrow({
        where: { token: token },
      })
    } catch (e) {
      this.logger.error(`Error Retrieving refresh token: ${token}`, e)
    }
    return null
  }
}
