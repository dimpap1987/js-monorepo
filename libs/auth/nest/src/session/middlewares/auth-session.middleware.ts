import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthException } from '../../common/exceptions/api-exception'

@Injectable()
export class AuthSessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    if (
      req.originalUrl.includes('/auth/logout') ||
      req.originalUrl.includes('/auth/register') ||
      req.originalUrl.includes('/auth/unregistered-user') ||
      req.originalUrl.includes('/auth/google/login') ||
      req.originalUrl.includes('/auth/github/login') ||
      req.originalUrl.includes('/auth/facebook/login') ||
      req.originalUrl.includes('/auth/google/redirect') ||
      req.originalUrl.includes('/auth/github/redirect') ||
      req.originalUrl.includes('/auth/facebook/redirect')
    ) {
      // If it's an excluded route, proceed to the next middleware
      next()
      return
    }

    if (!req.user?.user) {
      throw new AuthException(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED')
    }
    next()
  }
}
