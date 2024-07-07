import { Injectable, NestMiddleware } from '@nestjs/common'
import { csrfProtection } from '../auth.module'

@Injectable()
export class CsrfGeneratorMiddleware implements NestMiddleware {
  use(req, res, next) {
    csrfProtection(req, res, (err) => {
      if (err) {
        return next(err)
      }
      res.cookie('XSRF-TOKEN', req.csrfToken())
      res.locals._csrf = req.csrfToken()
      next()
    })
  }
}
