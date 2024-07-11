import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { getBrowserInfo, getIPAddress } from '@js-monorepo/utils'

@Injectable()
export class TokenRotationMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = req.cookies
      Logger.debug(`TokenRotationMiddleware: path = '${req.baseUrl}'`)

      if (accessToken && refreshToken) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          await this.authService.handleTokenRotation(
            accessToken,
            refreshToken,
            { browserInfo: getBrowserInfo(req), ipAddress: getIPAddress(req) }
          )

        this.authService.setRefreshTokenCookie(res, newRefreshToken)
        this.authService.setAccessTokenCookie(res, newAccessToken)
        req.cookies.accessToken = newAccessToken
        req.cookies.refreshToken = newRefreshToken
      }
    } catch (error) {
      Logger.error(`Token rotation error in path: ${req.baseUrl}`)
    }
    next()
  }
}
