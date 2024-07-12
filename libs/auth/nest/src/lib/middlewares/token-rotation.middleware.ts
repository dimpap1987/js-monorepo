import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { getBrowserInfo, getIPAddress } from '@js-monorepo/utils'

@Injectable()
export class TokenRotationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TokenRotationMiddleware.name)

  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = req.cookies
      // this.logger.debug(`path = '${req.baseUrl}'`)

      if (accessToken && refreshToken) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          await this.authService.handleTokenRotation(
            accessToken,
            refreshToken,
            { browserInfo: getBrowserInfo(req), ipAddress: getIPAddress(req) }
          )

        req.cookies.accessToken = newAccessToken
        req.cookies.refreshToken = newRefreshToken
        this.authService.setRefreshTokenCookie(res, newRefreshToken)
        this.authService.setAccessTokenCookie(res, newAccessToken)
      }
    } catch (error) {
      this.logger.error(`Error in path: ${req.baseUrl}`, error)
    }
    next()
  }
}
