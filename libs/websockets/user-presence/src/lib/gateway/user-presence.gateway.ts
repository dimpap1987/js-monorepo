import { AuthSessionUserCache } from '@js-monorepo/auth/nest/session'
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

import { BrokerEvents, WebSocketEvents } from '../constants'
import { WsGuard } from '../guards/ws.guard'
import { UserSocketService } from '../services/user-socket.service'
import { PubSubService } from '@js-monorepo/nest/redis-event-pub-sub'

export const ONLINE_USERS_ROOM = 'online_users_room'

@WebSocketGateway(4444, {
  pingInterval: 30000,
  pingTimeout: 5000,
  namespace: 'presence',
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class UserPresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  logger = new Logger(UserPresenceGateway.name)

  @WebSocketServer()
  namespace?: Namespace

  constructor(
    private readonly userSocketService: UserSocketService,
    private readonly pubSubService: PubSubService,
    private readonly authSessionUserCache: AuthSessionUserCache
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const userId = await this.userSocketService.getUserIdFromSocket(socket)

      if (!userId) {
        socket.disconnect()
      } else {
        await this.userSocketService.addSocketUser(userId, socket.id)

        const cachedUser =
          await this.authSessionUserCache.findOrSaveCacheUserById(
            Number(userId)
          )

        this.pubSubService.emit(BrokerEvents.announcements, {
          data: [`${cachedUser?.username}  is online`],
        })

        this.logger.debug(`User: ${userId} connected through websocket`)
      }
    } catch (e: any) {
      this.logger.error('Error while handling websocket connection', e.stack)
    }
  }

  async handleDisconnect(client: Socket) {
    this.userSocketService.removeSocketUser(client.id)
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket): Promise<void> {
    const userId = await this.userSocketService.getUserIdFromSocket(client)
    this.userSocketService.addSocketUser(userId, client.id)
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(WebSocketEvents.announcements.subscribe)
  async streamAnnouncements(@ConnectedSocket() client: any) {
    return this.pubSubService.createWebsocketStream(
      client,
      BrokerEvents.announcements,
      WebSocketEvents.announcements.emit
    )
  }
}
