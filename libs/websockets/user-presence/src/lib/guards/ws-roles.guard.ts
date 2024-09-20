import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { AuthSessionUserCache } from '@js-monorepo/auth/nest/session'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserSocketService } from '../services/user-socket.service'

@Injectable()
export class WsRolesGuard {
  constructor(
    private reflector: Reflector,
    private readonly userSocketService: UserSocketService,
    private readonly authSessionUserCache: AuthSessionUserCache
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    )
    if (!requiredRoles) return false

    const userId = await this.userSocketService.getUserIdFromSocket(
      context.switchToWs().getClient()
    )

    if (!userId) return false

    const sessionUser =
      await this.authSessionUserCache.findOrSaveCacheUserById(userId)
    return requiredRoles.some((role) => sessionUser?.roles?.includes(role))
  }
}
