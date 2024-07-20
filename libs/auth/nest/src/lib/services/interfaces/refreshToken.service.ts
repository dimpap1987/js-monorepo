import { RefreshTokenCreateDto, RefreshTokenDto } from '@js-monorepo/types'

export interface RefreshTokenService {
  storeRefreshToken(
    payload: RefreshTokenCreateDto
  ): Promise<RefreshTokenDto | null>

  revokeRefreshTokenById(tokenId: number): Promise<void>

  revokeRefreshTokensByUserId(userId: number): Promise<void>

  revokeRefreshTokenByToken(token: string): Promise<void>

  findRefreshToken(token: string): Promise<RefreshTokenDto | null>

  handleTokenRotation(
    accessToken: string,
    refreshToken: string,
    userMetadata?: { ipAddress?: string; browserInfo?: string }
  ): Promise<{ accessToken: string; refreshToken: string }>
}
