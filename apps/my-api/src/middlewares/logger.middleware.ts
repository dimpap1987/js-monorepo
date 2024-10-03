import { getIPAddress } from '@js-monorepo/utils/http'
import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl: url } = req

    const ip = getIPAddress(req)

    const userAgent = req.get('user-agent') || 'NONE'

    res.on('close', () => {
      const { statusCode } = res
      this.logger.log(
        `[${method} - ${statusCode} - ${url}] - [IP = ${ip}] - [USER_AGENT = ${userAgent}]`
      )
    })
    next()
  }
}
