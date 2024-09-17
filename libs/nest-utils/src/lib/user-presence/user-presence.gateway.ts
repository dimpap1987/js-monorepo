import { Inject, Logger, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Namespace, Socket } from 'socket.io'
import {
  EVENT_SUBSCRIBER_TOKEN,
  EventSubscriberInterface,
  OnlineUsersEvent,
} from '../redis-event-pub-sub'
import { OnlineUsersService } from './services/online-users.service'
import { UserSocketService } from './services/user-socket.service'
import { WsGuard } from './ws.guard'

export const ONLINE_USERS_ROOM = 'online_users_room'

export enum WebsocketEventSubscribeList {
  FETCH_ONLINE_USERS = 'fetch-online-users',
  EVENTS_ONLINE_USERS = 'events-online-users',
}

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
    private userSocketService: UserSocketService,
    @Inject(EVENT_SUBSCRIBER_TOKEN)
    private eventSubscriber: EventSubscriberInterface,
    private onlineUsersService: OnlineUsersService
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const userId = await this.userSocketService.getUserIdFromSocket(socket)

      if (!userId) {
        socket.disconnect()
      } else {
        await this.userSocketService.addSocketUser(userId, socket.id)
        this.onlineUsersService.loadOnlineUsers()
        this.logger.debug(`User: ${userId} connected through websocket`)
      }
    } catch (e: any) {
      this.logger.error('Error while handling websocket connection', e.stack)
    }
  }

  async handleDisconnect(client: Socket) {
    await this.userSocketService.removeSocketUser(client.id)
    this.onlineUsersService.loadOnlineUsers()
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket): Promise<void> {
    const userId = await this.userSocketService.getUserIdFromSocket(client)
    this.userSocketService.addSocketUser(userId, client.id)
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(WebsocketEventSubscribeList.FETCH_ONLINE_USERS)
  async streamMessagesData(@ConnectedSocket() client: any) {
    return this.eventSubscriber.createWebsocketStream(
      client,
      OnlineUsersEvent.eventName,
      WebsocketEventSubscribeList.EVENTS_ONLINE_USERS
    )
  }
}
