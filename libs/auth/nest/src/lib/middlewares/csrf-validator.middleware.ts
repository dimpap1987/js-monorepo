import { Injectable, NestMiddleware } from '@nestjs/common'
import csurf = require('csurf')

const csrfProtection = csurf({ cookie: { sameSite: true } })

@Injectable()
export class CsrfValidatorMiddleware implements NestMiddleware {
  use(req, res, next) {
    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
      return
    }
    csrfProtection(req, res, next)
  }
}
