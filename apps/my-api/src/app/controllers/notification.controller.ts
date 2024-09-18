import { SessionUser } from '@js-monorepo/auth/nest/session'
import { Controller, Post, Req, Sse } from '@nestjs/common'
import { ChannelService } from '../services/channel.service'
import { EventsService } from '../services/event.service'

@Controller('notifications')
export class NotificationController {
  constructor(
    private eventsService: EventsService,
    private channelService: ChannelService
  ) {}

  @Sse('subscribe')
  async events(@SessionUser() user) {
    // get user channels from DB
    const channels = await this.channelService.getChannelsByUserId(user?.id)
    const channelNames = channels?.map((channel) => channel.name)

    return this.eventsService.subscribe([user?.username, ...channelNames])
  }

  @Post('emit')
  async emit(@Req() req: any) {
    const { channel, message } = req.body
    this.eventsService.emit(channel, {
      id: Math.random() * 1000,
      message: message,
      time: new Date(),
    })
    return { ok: true }
  }
}
