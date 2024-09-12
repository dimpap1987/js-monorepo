import { Module } from '@nestjs/common'
import { UserPresenceGateway } from './user-presence.gateway'
import { UserPresenceService } from './user-presence.service'
import { WsGuard } from './ws.guard'

@Module({
  providers: [UserPresenceGateway, UserPresenceService, WsGuard],
  exports: [UserPresenceGateway, UserPresenceService, WsGuard],
})
export class UserPresenceModule {}
