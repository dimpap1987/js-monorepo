import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  EVENT_EMITTER_TOKEN,
  EventEmitterInterface,
  OnlineUsersEvent,
} from '../redis-event-pub-sub'
import { OnlineUsersService } from './services/online-users.service'

@Injectable()
export class UserPresenceScheduler {
  logger = new Logger(UserPresenceScheduler.name)

  constructor(
    private onlineUsersService: OnlineUsersService,
    @Inject(EVENT_EMITTER_TOKEN)
    private readonly eventEmitter: EventEmitterInterface
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async emitOnlineUsers() {
    try {
      const onlineUsers = await this.onlineUsersService.loadOnlineUsers()
      this.eventEmitter.emit(
        OnlineUsersEvent.name,
        new OnlineUsersEvent(onlineUsers)
      )
    } catch (e: any) {
      this.logger.error('Error while emitting online users', e.stack)
    }
  }
}
