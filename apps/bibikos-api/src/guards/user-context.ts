import { SessionUser } from '@js-monorepo/types/session'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AppUserService } from '../app/modules/scheduling'
import { AppUserContextType } from '../decorators/app-user.decorator'

@Injectable()
export class UserContextGuard implements CanActivate {
  constructor(private readonly appUserService: AppUserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const sessionUser = request.user?.user as SessionUser | undefined

    // Anonymous / public request
    if (!sessionUser) {
      request.userContext = null
      return true
    }

    const appUser = await this.appUserService.createOrSelectByAuthUserId(sessionUser.id)

    request.userContext = {
      user: { ...sessionUser },
      appUserId: appUser.id,
      participantId: appUser.participantProfileId,
      organizerId: appUser.organizerProfileId,
    } satisfies AppUserContextType
    return true
  }
}
