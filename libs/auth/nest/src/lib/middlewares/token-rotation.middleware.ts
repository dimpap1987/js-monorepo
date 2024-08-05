import { getBrowserInfo, getIPAddress } from '@js-monorepo/utils'
import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { RefreshTokenService } from '../services/interfaces/refreshToken.service'
import { authCookiesOptions } from '../utils'

@Injectable()
export class TokenRotationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TokenRotationMiddleware.name)

  constructor(
    @Inject('REFRESH_TOKEN_SERVICE')
    private refreshTokenService: RefreshTokenService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = req.cookies
      if (accessToken && refreshToken) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          await this.refreshTokenService.handleTokenRotation(
            accessToken,
            refreshToken,
            { browserInfo: getBrowserInfo(req), ipAddress: getIPAddress(req) }
          )

        req.cookies.accessToken = newAccessToken
        req.cookies.refreshToken = newRefreshToken
        this.setRefreshTokenCookie(res, newRefreshToken)
        this.setAccessTokenCookie(res, newAccessToken)
      }
    } catch (error: any) {
      this.logger.error(`Error in path: ${req.baseUrl}`, error.stack)
    }
    next()
  }

  setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie('accessToken', accessToken, authCookiesOptions)
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, authCookiesOptions)
  }
}
