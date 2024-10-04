import { SessionUser } from '@js-monorepo/auth/nest/session'
import { Controller, Post, Req, Sse } from '@nestjs/common'
import { ChannelService } from '../services/channel.service'

@Controller('notifications')
export class NotificationController {
  constructor(private channelService: ChannelService) {}

  @Sse('subscribe')
  async events(@SessionUser() user) {
    // get user channels from DB
    // const channels = await this.channelService.getChannelsByUserId(user?.id)
  }

  @Post('emit')
  async emit(@Req() req: any) {
    const { channel, message } = req.body

    return { ok: true }
  }
}
