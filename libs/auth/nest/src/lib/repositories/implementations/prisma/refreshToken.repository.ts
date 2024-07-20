import { PrismaService } from '@js-monorepo/db'
import { RefreshTokenCreateDto, RefreshTokenDto } from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { RefreshTokenRepository } from '../../refreshToken.repository'

@Injectable()
export class RefreshTokenRepositoryPrismaImpl
  implements RefreshTokenRepository
{
  constructor(private readonly dbClient: PrismaService) {}

  async storeRefreshToken(
    payload: RefreshTokenCreateDto
  ): Promise<RefreshTokenDto | null> {
    return this.dbClient.refreshToken.create({
      data: {
        ...payload,
      },
    })
  }

  async revokeRefreshTokenById(tokenId: number): Promise<void> {
    await this.dbClient.refreshToken.update({
      where: {
        id: tokenId,
      },
      data: {
        revoked: true,
      },
    })
  }

  async revokeRefreshTokensByUserId(userId: number): Promise<void> {
    await this.dbClient.refreshToken.updateMany({
      where: {
        userId: userId,
      },
      data: {
        revoked: true,
      },
    })
  }

  async revokeRefreshTokenByToken(token: string): Promise<void> {
    await this.dbClient.refreshToken.update({
      where: {
        token: token,
      },
      data: {
        revoked: true,
      },
    })
  }

  async findRefreshToken(token: string): Promise<RefreshTokenDto> {
    return this.dbClient.refreshToken.findUniqueOrThrow({
      where: { token: token },
    })
  }
}
