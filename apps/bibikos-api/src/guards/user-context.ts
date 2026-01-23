import { SessionUser } from '@js-monorepo/types/session'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AppService } from '../app/services/app.service'
import { AppUserContextType } from '../decorators/app-user.decorator'

@Injectable()
export class UserContextGuard implements CanActivate {
  constructor(private readonly appService: AppService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const sessionUser = request.user?.user as SessionUser | undefined

    // Anonymous / public request
    if (!sessionUser) {
      request.userContext = null
      return true
    }

    const result = await this.appService.findUserContext(sessionUser.id)

    request.userContext = {
      user: { ...sessionUser },
      appUserId: result.appUserId,
      participantId: result.participantId,
      organizerId: result.organizerId,
    } satisfies AppUserContextType
    return true
  }
}
