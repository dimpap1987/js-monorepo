import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { RolesGuard } from '@js-monorepo/auth/nest/session'
import { Events, UserPresenceWebsocketService } from '@js-monorepo/user-presence'
import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common'

@Controller('announcements')
@UseGuards(RolesGuard)
@HasRoles(RolesEnum.ADMIN)
export class AnnouncementsController {
  private readonly logger = new Logger(AnnouncementsController.name)

  constructor(private userPresenceWebsocketService: UserPresenceWebsocketService) {}

  @Post()
  async save(
    @Body()
    { announcement, userIds, isGlobal }: { announcement: string; userIds: number[]; isGlobal: boolean }
  ) {
    this.logger.debug(`Create announcement | Global: ${isGlobal} and message: ${announcement}`)

    if (isGlobal) {
      this.userPresenceWebsocketService.broadcast(Events.announcements, [announcement])
    } else {
      if (userIds?.length > 0) {
        this.userPresenceWebsocketService.sendToUsers(userIds, Events.announcements, [announcement])
      }
    }
  }
}
