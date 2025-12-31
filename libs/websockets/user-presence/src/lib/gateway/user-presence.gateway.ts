import { Logger, OnModuleDestroy, UseGuards } from '@nestjs/common'
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
import { Events, Rooms } from '../constants/constants'
import { WsRolesGuard } from '../guards/ws-roles.guard'
import { OnlineUsersService } from '../services/online-users.service'
import { UserSocketService } from '../services/user-socket.service'

@WebSocketGateway({
  pingInterval: 30000,
  pingTimeout: 5000,
  path: '/ws',
  namespace: 'presence',
  cors: {
    origin: process.env['APP_URL'],
  },
  transports: ['websocket'],
})
export class UserPresenceGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy {
  private logger = new Logger(UserPresenceGateway.name)
  private intervalId?: NodeJS.Timeout

  @WebSocketServer()
  namespace!: Namespace

  constructor(
    private readonly userSocketService: UserSocketService,
    private readonly onlineUsersService: OnlineUsersService
  ) {
    this.startUserSocketSaving()
  }

  onModuleDestroy() {
    this.logger.debug('UserPresenceGateway webscoket service shut down')
    clearInterval(this.intervalId)
    this.namespace?.disconnectSockets()
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
      await this.onlineUsersService.remove(`${userId}:${socket.id}`)
    }
    this.emitOnlineUsersToAdmins()
  }

  @UseGuards(WsRolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  @SubscribeMessage('subscribe:online-users')
  async getOnlineUsers(@ConnectedSocket() client: Socket) {
    client.emit(Events.onlineUsers, await this.onlineUsersService.getList())
  }

  @UseGuards(WsRolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  @SubscribeMessage('subscribe:join-admin-room')
  async joinAdminGroup(@ConnectedSocket() client: Socket) {
    client.join(Rooms.admin)
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
        socket: socket.id,
        pid: process.pid,
        session: socket.session,
      },
      60 * 5
    )
    const onlineUsersPromise = this.onlineUsersService.add(`${socket.user.id}:${socket.id}`)

    await Promise.all([socketPromise, onlineUsersPromise])
  }

  async emitOnlineUsersToAdmins() {
    this.namespace.to(Rooms.admin).emit(Events.onlineUsers, await this.onlineUsersService.getList())
  }

  private startUserSocketSaving() {
    this.intervalId = setInterval(async () => {
      if (this.namespace?.sockets) {
        const promises = Array.from(this.namespace.sockets).map(([_, socket]) =>
          this.saveUserSocketAndOnlineList(socket)
        )
        await Promise.all(promises)
      }
    }, 200000)
  }
}
