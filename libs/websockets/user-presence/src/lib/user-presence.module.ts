import { RedisEventPubSubModule } from '@js-monorepo/nest/redis-event-pub-sub'
import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { BrokerEvents } from './constants'
import { OnlineUsersService } from './services/online-users.service'
import { UserSocketService } from './services/user-socket.service'
import { UserPresenceGateway } from './gateway/user-presence.gateway'
import { WsGuard } from './guards/ws.guard'
import { UserPresenceScheduler } from './schedulers/user-presence.scheduler'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisEventPubSubModule.registerEvents([
      BrokerEvents.onlineUsers,
      BrokerEvents.announcements,
    ]),
  ],
  providers: [
    UserPresenceGateway,
    UserSocketService,
    WsGuard,
    UserPresenceScheduler,
    OnlineUsersService,
  ],
  exports: [UserSocketService, WsGuard, OnlineUsersService],
})
export class UserPresenceModule {}
