import { RefreshTokenCreateDto, RefreshTokenDto } from '@js-monorepo/types'

export interface RefreshTokenRepository {
  storeRefreshToken(
    payload: RefreshTokenCreateDto
  ): Promise<RefreshTokenDto | null>

  revokeRefreshTokenById(tokenId: number): Promise<void>

  revokeRefreshTokensByUserId(userId: number): Promise<void>

  revokeRefreshTokenByToken(token: string): Promise<void>

  findRefreshToken(token: string): Promise<RefreshTokenDto>
}
