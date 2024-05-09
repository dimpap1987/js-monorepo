import { JwtAuthGuard } from '@js-monorepo/auth'
import { JwtPayload } from '@js-monorepo/types'
import { Controller, Inject, Post, Req, Sse, UseGuards } from '@nestjs/common'
import { EventsService } from '../services/event.service'
import { ChannelService } from '../services/channel.service'

@Controller('notifications')
export class NotificationController {
  constructor(
    private eventsService: EventsService,
    private channelService: ChannelService,
    @Inject('jwt') private readonly jwt: JwtPayload
  ) {}

  @Sse('subscribe')
  @UseGuards(JwtAuthGuard)
  async events() {
    // get user channels from DB
    const channels = await this.channelService.getChannelsByUsername(
      this.jwt.user.username
    )
    const channelNames = channels.map((channel) => channel.name)
    //subscribe to these channels
    return this.eventsService.subscribe([
      this.jwt.user.username,
      ...channelNames,
    ])
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
