import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class RefererMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const referer = req.headers?.referer

      if (referer) {
        // Logger.debug(
        //   `Referer set for 'redirect-after-login' with value: ${referer}`
        // )
        req.session['redirect-after-login'] = referer
      }
    } catch (error: any) {
      Logger.error(`Error in RefererMiddleware: ${error}`, error.stack, RefererMiddleware.name)
    }
    next()
  }
}
