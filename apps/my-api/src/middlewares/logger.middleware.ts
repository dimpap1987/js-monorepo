import { getIPAddress } from '@js-monorepo/utils/http'
import { AuthJWT } from '@js-monorepo/auth/nest'
import { JwtPayload } from '@js-monorepo/types'
import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  logger = new Logger('HTTP')

  constructor(@Inject(AuthJWT) private readonly jwt: JwtPayload) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl: url } = req

    const ip = getIPAddress(req)
    const id = this.jwt?.user?.id

    const userAgent = req.get('user-agent') || 'NONE'

    res.on('close', () => {
      const { statusCode } = res
      const userId = id ? id : 'ANONYMOUS'
      this.logger.log(
        `[${method} - ${statusCode} - ${url}] - [USER = ${userId}] - [IP = ${ip}] - [USER_AGENT = ${userAgent}]`
      )
    })
    next()
  }
}
