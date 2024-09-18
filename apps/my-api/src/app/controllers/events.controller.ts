import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import {
  LoggedInGuard,
  RolesGuard,
  SessionUser,
} from '@js-monorepo/auth/nest/session'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { EventSchema, EventSchemaType } from '@js-monorepo/schemas'
import { EventsReponse } from '@js-monorepo/types'
import { Body, Controller, Post, Sse, UseGuards } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { ChannelService } from '../services/channel.service'
import { EventsService } from '../services/event.service'

@Controller('events')
export class EventsController {
  constructor(
    private eventsService: EventsService,
    private channelService: ChannelService
  ) {}

  @Sse('subscribe')
  @UseGuards(LoggedInGuard)
  async events(@SessionUser() user) {
    // get user channels from DB
    const channels = await this.channelService.getChannelsByUserId(user?.id)
    const channelNames = channels?.map((channel) => channel.name)

    return this.eventsService.subscribe([user?.username, ...channelNames])
  }

  @Post('emit')
  @UseGuards(RolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  async emit(
    @Body(new ZodPipe(EventSchema))
    { channel, data, type }: EventSchemaType
  ) {
    this.eventsService.emit(channel, {
      id: uuidv4(),
      data,
      time: new Date(),
      type,
    })

    return { ok: true }
  }
}
