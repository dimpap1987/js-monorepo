import { Injectable, NestMiddleware } from '@nestjs/common'
import { authCookiesOptions } from '../utils'
import csurf = require('csurf')

export const csrfProtection = csurf({
  cookie: authCookiesOptions,
})

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
