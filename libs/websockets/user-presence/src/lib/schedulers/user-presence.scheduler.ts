import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { BrokerEvents } from '../constants'
import { OnlineUsersService } from '../services/online-users.service'
import { PubSubService } from '@js-monorepo/nest/redis-event-pub-sub'

@Injectable()
export class UserPresenceScheduler {
  logger = new Logger(UserPresenceScheduler.name)

  constructor(
    private onlineUsersService: OnlineUsersService,
    private pubSubService: PubSubService
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async emitOnlineUsers() {
    try {
      const onlineUsers = await this.onlineUsersService.loadOnlineUsers()
      this.pubSubService.emit(BrokerEvents.onlineUsers, {
        data: onlineUsers,
      })
    } catch (e: any) {
      this.logger.error('Error while emitting online users', e.stack)
    }
  }
}
