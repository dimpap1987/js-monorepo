import { Module } from '@nestjs/common'
import { RedisIoAdapter } from './adapters/redis-adapter'
import { UserPresenceGateway } from './gateway/user-presence.gateway'
import { WsLoginGuard } from './guards/ws-login.guard'
import { WsRolesGuard } from './guards/ws-roles.guard'
import { OnlineUsersService } from './services/online-users.service'
import { UserPresenceWebsocketService } from './services/user-presence.service'
import { UserSocketService } from './services/user-socket.service'

@Module({
  providers: [
    UserPresenceGateway,
    UserSocketService,
    WsLoginGuard,
    OnlineUsersService,
    RedisIoAdapter,
    WsRolesGuard,
    UserPresenceWebsocketService,
  ],
  exports: [
    UserPresenceGateway,
    UserSocketService,
    WsLoginGuard,
    OnlineUsersService,
    RedisIoAdapter,
    WsRolesGuard,
    UserPresenceWebsocketService,
  ],
})
export class UserPresenceModule {}
