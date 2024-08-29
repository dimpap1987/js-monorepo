import { getIPAddress } from '@js-monorepo/utils/http'
import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl: url } = req

    const ip = getIPAddress(req)
    const user = req.user?.user

    const userAgent = req.get('user-agent') || 'NONE'

    res.on('close', () => {
      const { statusCode } = res
      const username = user?.username ? user?.username : 'ANONYMOUS'
      this.logger.log(
        `[${method} - ${statusCode} - ${url}] - [USER = ${username}] - [IP = ${ip}] - [USER_AGENT = ${userAgent}]`
      )
    })
    next()
  }
}
