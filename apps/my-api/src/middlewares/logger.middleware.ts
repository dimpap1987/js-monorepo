import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private httpLogger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl: url } = req

    const userAgent = req.get('user-agent') ? `[USER_AGENT=${req.get('user-agent')}]` : ''

    res.on('close', () => {
      const { statusCode } = res
      this.httpLogger.log(`[${method} - ${statusCode} - ${url}] - ${userAgent}`)
    })
    next()
  }
}
