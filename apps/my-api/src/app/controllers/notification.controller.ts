import { JwtAuthGuard } from '@js-monorepo/auth'
import { JwtPayload } from '@js-monorepo/types'
import { Controller, Inject, Post, Req, Sse, UseGuards } from '@nestjs/common'
import { EventsService } from '../services/event.service'

@Controller('notifications')
export class NotificationController {
  constructor(
    private eventsService: EventsService,
    @Inject('jwt') private readonly jwt: JwtPayload
  ) {}

  @Sse('subscribe')
  @UseGuards(JwtAuthGuard)
  events() {
    return this.eventsService.subscribe([this.jwt.user.username, 'global'])
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