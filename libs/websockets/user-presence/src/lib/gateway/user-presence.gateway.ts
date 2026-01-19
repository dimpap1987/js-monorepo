import { Logger, OnModuleDestroy, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
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

    // Remove this specific socket from Redis
    await this.userSocketService.removeSocketUserBySocketId(socket.id)

    if (userId) {
      // Remove this socket entry from online users
      await this.onlineUsersService.remove(`${userId}:${socket.id}`)

      // Check if user has any remaining sockets across all instances
      // Only emit offline status if this was their last connection
      const remainingSockets = await this.userSocketService.countUserSockets(userId)
      if (remainingSockets === 0) {
        this.logger.debug(`User: ${userId} has no remaining sockets - marking as offline`)
      } else {
        this.logger.debug(`User: ${userId} still has ${remainingSockets} active socket(s)`)
      }
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

  @SubscribeMessage('subscribe:join-organizer-room')
  async joinOrganizerRoom(@ConnectedSocket() client: Socket, @MessageBody() organizerId: number) {
    if (!organizerId || typeof organizerId !== 'number') {
      this.logger.warn(`Invalid organizerId provided for room subscription: ${organizerId}`)
      return
    }
    const room = Rooms.organizer(organizerId)
    client.join(room)
    this.logger.debug(`User ${client.user?.id} joined organizer room: ${room}`)
    client.emit('message', `Joined organizer room: ${room}`)
  }

  @SubscribeMessage('subscribe:leave-organizer-room')
  async leaveOrganizerRoom(@ConnectedSocket() client: Socket, @MessageBody() organizerId: number) {
    if (!organizerId || typeof organizerId !== 'number') {
      return
    }
    const room = Rooms.organizer(organizerId)
    client.leave(room)
    this.logger.debug(`User ${client.user?.id} left organizer room: ${room}`)
  }

  @SubscribeMessage('subscribe:join-participant-room')
  async joinParticipantRoom(@ConnectedSocket() client: Socket, @MessageBody() participantId: number) {
    if (!participantId || typeof participantId !== 'number') {
      this.logger.warn(`Invalid participantId provided for room subscription: ${participantId}`)
      return
    }
    const room = Rooms.participant(participantId)
    client.join(room)
    this.logger.debug(`User ${client.user?.id} joined participant room: ${room}`)
    client.emit('message', `Joined participant room: ${room}`)
  }

  @SubscribeMessage('subscribe:leave-participant-room')
  async leaveParticipantRoom(@ConnectedSocket() client: Socket, @MessageBody() participantId: number) {
    if (!participantId || typeof participantId !== 'number') {
      return
    }
    const room = Rooms.participant(participantId)
    client.leave(room)
    this.logger.debug(`User ${client.user?.id} left participant room: ${room}`)
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
