import { Logger, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Namespace, Socket } from 'socket.io'

import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { WsRolesGuard } from '../guards/ws-roles.guard'
import { OnlineUsersService } from '../services/online-users.service'
import { UserSocketService } from '../services/user-socket.service'
export const ONLINE_USERS_ROOM = 'online_users_room'

@WebSocketGateway({
  pingInterval: 30000,
  pingTimeout: 5000,
  path: '/ws',
  namespace: 'presence',
  cors: {
    origin: process.env['CORS_ORIGIN_DOMAINS'],
  },
  transports: ['websocket'],
})
export class UserPresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger(UserPresenceGateway.name)

  @WebSocketServer()
  namespace!: Namespace

  constructor(
    private readonly userSocketService: UserSocketService,
    private readonly onlineUsersService: OnlineUsersService
  ) {
    setInterval(async () => {
      if (this.namespace?.sockets) {
        const promises = Array.from(this.namespace.sockets).map(([_, socket]) =>
          this.saveUserSocketAndOnlineList(socket)
        )
        await Promise.all(promises)
      }
    }, 240000) //every 4 minutes
  }

  async handleConnection(socket: Socket) {
    try {
      await this.saveUserSocketAndOnlineList(socket)
      this.logger.debug(`User: ${socket.user?.id} connected through websocket`)
      this.emitOnlineUsersToAdmins()
    } catch (e: any) {
      this.logger.error('Error while handling websocket connection', e.stack)
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = socket.user?.id
    this.logger.debug(`User: ${userId} disconnected through websocket`)
    await this.userSocketService.removeSocketUserBySocketId(socket.id)
    if (userId) {
      await this.onlineUsersService.removeUser(`${userId}:${socket.id}`)
    }
    this.emitOnlineUsersToAdmins()
  }

  @UseGuards(WsRolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  @SubscribeMessage('subscribe:online-users')
  async getOnlineUsers(@ConnectedSocket() client: Socket) {
    client.emit(
      'event:online-users',
      await this.onlineUsersService.getOnlineUsersList()
    )
  }

  @UseGuards(WsRolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  @SubscribeMessage('subscribe:join-admin-room')
  async joinAdminGroup(@ConnectedSocket() client: Socket) {
    client.join('admin-room')
    client.emit('message', 'You have successfully joined the admin room')
  }

  private async saveUserSocketAndOnlineList(socket: Socket) {
    if (!socket?.user?.id) {
      socket.disconnect()
      return
    }

    const socketPromise = this.userSocketService.addSocketUser(
      {
        userId: socket.user.id,
        socketId: socket.id,
        pid: process.pid,
      },
      60 * 5
    )
    const onlineUsersPromise = this.onlineUsersService.addUser(
      `${socket.user.id}:${socket.id}`
    )

    await Promise.all([socketPromise, onlineUsersPromise])
  }

  async emitOnlineUsersToAdmins() {
    this.namespace
      .to('admin-room')
      .emit(
        'event:online-users',
        await this.onlineUsersService.getOnlineUsersList()
      )
  }
}
