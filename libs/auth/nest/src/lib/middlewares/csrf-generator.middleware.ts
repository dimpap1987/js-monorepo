import { Injectable, NestMiddleware } from '@nestjs/common'

@Injectable()
export class CsrfGeneratorMiddleware implements NestMiddleware {
  use(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
      httpOnly: true, // Set the cookie as HTTPOnly
    })
    res.locals._csrf = req.csrfToken()
    next()
  }
}
