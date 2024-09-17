import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import {
  OnlineUsersEvent,
  RedisEventPubSubModule,
} from '../redis-event-pub-sub'
import { OnlineUsersService } from './services/online-users.service'
import { UserSocketService } from './services/user-socket.service'
import { UserPresenceGateway } from './user-presence.gateway'
import { UserPresenceScheduler } from './user-presence.scheduler'
import { WsGuard } from './ws.guard'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisEventPubSubModule.registerEvents([OnlineUsersEvent.eventName]),
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
