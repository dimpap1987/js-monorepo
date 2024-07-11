import { Inject, Injectable, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class RefreshTokenService {
  constructor(@Inject('DB_CLIENT') private readonly dbClient: PrismaClient) {}

  async createRefreshToken(
    newToken: string,
    userId: number,
    client = this.dbClient
  ) {
    try {
      Logger.debug(`Creating refresh token for user: ${userId}`)
      return await client.refreshToken.create({
        data: {
          user_id: userId,
          token: newToken,
        },
      })
    } catch (e) {
      Logger.error(`Error Creating refresh token for user: ${userId}`)
      return null
    }
  }

  async revokeRefreshTokenOfUser(tokenId: number, client = this.dbClient) {
    try {
      Logger.debug(`Revoking refresh token with id: ${tokenId}`)
      await client.refreshToken.update({
        where: {
          id: tokenId,
        },
        data: {
          revoked: true,
        },
      })
    } catch (e) {
      Logger.error(`Error Revoking refresh token with id: ${tokenId}`)
    }
  }

  async revokeRefreshTokensOfUser(userId: number, client = this.dbClient) {
    try {
      Logger.debug(`Revoking refresh tokens of user with id: ${userId}`)
      await client.refreshToken.updateMany({
        where: {
          user_id: userId,
        },
        data: {
          revoked: true,
        },
      })
    } catch (e) {
      Logger.error(`Error Revoking refresh tokens of user with id: ${userId}`)
    }
  }

  async revokeRefreshTokensOfUserByToken(
    token: string,
    client = this.dbClient
  ) {
    try {
      Logger.debug(`Revoking refresh token`)
      await client.refreshToken.update({
        where: {
          token: token,
        },
        data: {
          revoked: true,
        },
      })
    } catch (e) {
      Logger.error('Revoking refresh token`', e)
    }
  }

  async findRefreshToken(token: string, client = this.dbClient) {
    try {
      Logger.debug(`Retrieving refresh token`)
      return await client.refreshToken.findUniqueOrThrow({
        where: { token: token },
      })
    } catch (e) {
      Logger.error(`Error Retrieving refresh token: ${token}`)
    }
    return null
  }
}
