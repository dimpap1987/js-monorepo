import { getIPAddress } from '@js-monorepo/utils/http'
import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private httpLogger = new Logger('HTTP')
  private nextLogger = new Logger('NEXT') // Requests that coming from Next js server

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl: url } = req

    const ip = getIPAddress(req)

    const userAgent = req.get('user-agent') || 'NONE'

    res.on('close', () => {
      const { statusCode } = res
      if (userAgent?.includes('Next.js Middleware') || userAgent === 'node') {
        this.nextLogger.debug(
          `[${method} - ${statusCode} - ${url}] - [IP=${ip}] - [USER_AGENT=${userAgent}]`
        )
      } else {
        this.httpLogger.log(
          `[${method} - ${statusCode} - ${url}] - [IP=${ip}] - [USER_AGENT=${userAgent}]`
        )
      }
    })
    next()
  }
}
