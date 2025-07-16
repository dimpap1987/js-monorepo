import { Injectable, NestMiddleware } from '@nestjs/common'
import csurf from 'csurf'
import { authCookiesOptions } from '../utils'

// CSRF protection middleware
export const csrfProtection = csurf({
  cookie: authCookiesOptions,
})

function handleCsrfTokenGeneration(req: any, res: any) {
  const token = req.csrfToken?.()
  if (token) {
    res.cookie('XSRF-TOKEN', token, { ...authCookiesOptions, httpOnly: false })
    res.locals._csrf = token
  }
}
@Injectable()
export class CsrfGeneratorMiddleware implements NestMiddleware {
  use(req: any, res: any, next: any) {
    csrfProtection(req, res, (err) => {
      if (err) {
        return next(err)
      }
      handleCsrfTokenGeneration(req, res)
      next()
    })
  }
}
