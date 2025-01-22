import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { AuthException } from '../../common/exceptions/api-exception'

@Injectable()
export class LoggedInGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (context.switchToHttp().getRequest().isAuthenticated()) {
      return true
    }
    throw new AuthException(HttpStatus.FORBIDDEN, `Invalid session`)
  }
}
