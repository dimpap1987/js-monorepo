import { Inject, Logger, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { from, map, Observable } from 'rxjs'
import { Namespace, Socket } from 'socket.io'
import {
  EVENT_SUBSCRIBER_TOKEN,
  EventSubscriberInterface,
  OnlineUsersEvent,
} from '../redis-event-pub-sub'
import { UserPresenceService } from './user-presence.service'
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
    private userPresenceService: UserPresenceService,
    @Inject(EVENT_SUBSCRIBER_TOKEN)
    private eventSubscriber: EventSubscriberInterface
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const userId = await this.userPresenceService.getUserIdFromSocket(socket)

      if (!userId) {
        socket.disconnect()
      } else {
        this.userPresenceService.addOnlineUser(userId, socket.id)
        this.logger.debug(`User: ${userId} connected through websocket`)
      }
    } catch (e: any) {
      this.logger.error('Error while handling websocket connection', e.stack)
    }
  }

  async handleDisconnect(client: Socket) {
    this.userPresenceService.removeOnlineUser(client.id)
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket): Promise<void> {
    const userId = await this.userPresenceService.getUserIdFromSocket(client)
    this.userPresenceService.addOnlineUser(userId, client.id)
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(WebsocketEventSubscribeList.FETCH_ONLINE_USERS)
  async streamMessagesData(@ConnectedSocket() client: any) {
    const stream$ = this.createWebsocketStreamFromEventFactory(
      client,
      this.eventSubscriber,
      OnlineUsersEvent.eventName
    )

    const event = WebsocketEventSubscribeList.EVENTS_ONLINE_USERS
    return from(stream$).pipe(map((data) => ({ event, data })))
  }

  private createWebsocketStreamFromEventFactory(
    client: any,
    eventSubscriber: EventSubscriberInterface,
    eventName: string
  ): Observable<any> {
    return new Observable((observer) => {
      const dynamicListener = (
        data: OnlineUsersEvent<{ userId: number }>['data']
      ) => {
        observer.next(data)
      }

      eventSubscriber.on(eventName, dynamicListener)

      client.on('disconnect', () => {
        eventSubscriber.off(eventName, dynamicListener)
      })
    })
  }
}
