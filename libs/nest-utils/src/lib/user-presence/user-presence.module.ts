import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import {
  OnlineUsersEvent,
  RedisEventPubSubModule,
} from '../redis-event-pub-sub'
import { UserPresenceGateway } from './user-presence.gateway'
import { UserPresenceScheduler } from './user-presence.scheduler'
import { UserPresenceService } from './user-presence.service'
import { WsGuard } from './ws.guard'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisEventPubSubModule.registerEvents([OnlineUsersEvent.eventName]),
  ],
  providers: [
    UserPresenceGateway,
    UserPresenceService,
    WsGuard,
    UserPresenceScheduler,
  ],
  exports: [
    UserPresenceGateway,
    UserPresenceService,
    WsGuard,
    UserPresenceScheduler,
  ],
})
export class UserPresenceModule {}
