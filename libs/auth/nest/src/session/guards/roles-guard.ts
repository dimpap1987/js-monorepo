import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RolesEnum } from '../../common/types'
import { LoggedInGuard } from './login.guard'

@Injectable()
export class RolesGuard extends LoggedInGuard {
  constructor(private reflector: Reflector) {
    super()
  }

  override canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    )
    if (!requiredRoles) return true

    const req = context.switchToHttp().getRequest()
    return (
      super.canActivate(context) &&
      requiredRoles.some((role) => req.user?.user?.roles?.includes(role))
    )
  }
}
