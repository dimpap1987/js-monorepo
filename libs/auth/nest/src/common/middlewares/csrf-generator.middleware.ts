import { Injectable, NestMiddleware } from '@nestjs/common'
import csurf from 'csurf'
import { authCookiesOptions } from '../utils'

export const csrfProtection = csurf({
  cookie: authCookiesOptions,
})

@Injectable()
export class CsrfGeneratorMiddleware implements NestMiddleware {
  use(req: any, res: any, next: any) {
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
