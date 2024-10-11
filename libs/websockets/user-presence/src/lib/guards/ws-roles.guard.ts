import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class WsRolesGuard {
  constructor(
    private reflector: Reflector,
    private readonly authSessionUserCacheService: AuthSessionUserCacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    )
    if (!requiredRoles) return false

    const userId = context.switchToWs().getClient().user.id
    if (!userId) return false

    const sessionUser =
      await this.authSessionUserCacheService.findOrSaveAuthUserById(userId)
    return requiredRoles.some((role) => sessionUser?.roles?.includes(role))
  }
}
