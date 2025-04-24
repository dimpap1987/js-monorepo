import { RedisOnlineUsersKey, RedisSocketUserKey } from '@js-monorepo/auth/nest/common/types'
import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisIoAdapter } from './adapters/redis-adapter'
import { UserPresenceGateway } from './gateway/user-presence.gateway'
import { WsLoginGuard } from './guards/ws-login.guard'
import { WsRolesGuard } from './guards/ws-roles.guard'
import { OnlineUsersService } from './services/online-users.service'
import { UserPresenceWebsocketService } from './services/user-presence.service'
import { UserSocketService } from './services/user-socket.service'

@Global()
@Module({
  providers: [
    UserPresenceGateway,
    UserSocketService,
    WsLoginGuard,
    OnlineUsersService,
    RedisIoAdapter,
    WsRolesGuard,
    UserPresenceWebsocketService,
    {
      provide: RedisSocketUserKey,
      useFactory: (configService: ConfigService) => {
        return configService.get<string>('REDIS_NAMESPACE')
          ? `${configService.get<string>('REDIS_NAMESPACE')}:online:socket-user:`
          : 'online:socket-user:'
      },
      inject: [ConfigService],
    },
    {
      provide: RedisOnlineUsersKey,
      useFactory: (configService: ConfigService) => {
        return configService.get<string>('REDIS_NAMESPACE')
          ? `${configService.get<string>('REDIS_NAMESPACE')}:online:online-users-list`
          : 'online:online-users-list'
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    UserPresenceGateway,
    WsLoginGuard,
    OnlineUsersService,
    RedisIoAdapter,
    WsRolesGuard,
    UserPresenceWebsocketService,
    RedisSocketUserKey,
    RedisOnlineUsersKey,
  ],
})
export class UserPresenceModule {}
