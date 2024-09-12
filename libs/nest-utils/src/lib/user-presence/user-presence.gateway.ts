import { Logger, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { UserPresenceService } from './user-presence.service'
import { WsGuard } from './ws.guard'

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

  constructor(private userPresenceService: UserPresenceService) {}

  async handleConnection(client: Socket) {
    try {
      const userId = await this.userPresenceService.getUserIdFromSocket(client)

      if (!userId) {
        client.disconnect()
      } else {
        this.userPresenceService.addOnlineUser(userId, client.id)
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
}
