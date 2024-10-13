import { Injectable, Logger } from '@nestjs/common'
import { UserPresenceGateway } from '../gateway/user-presence.gateway'
import { OnlineUsersService } from './online-users.service'
import { UserSocketService } from './user-socket.service'

@Injectable()
export class UserPresenceWebsocketService {
  private logger = new Logger(UserPresenceWebsocketService.name)

  constructor(
    private readonly userPresenceGateway: UserPresenceGateway,
    private readonly onlineUsersService: OnlineUsersService,
    private readonly userSocketService: UserSocketService
  ) {}

  // Send message to a specific room in a specific namespace (presence)
  sendToRoom(room: string, event: string, message: any) {
    this.userPresenceGateway.namespace.to(room).emit(event, message)
  }

  sendToRooms(rooms: string[], event: string, message: any) {
    this.userPresenceGateway.namespace.to(rooms).emit(event, message)
  }

  sendToRoomExceptClient(
    room: string,
    clientId: string,
    event: string,
    message: any
  ) {
    this.userPresenceGateway.namespace
      .to(room)
      .except(clientId)
      .emit(event, message)
  }

  // Broadcast to all clients in the presence namespace
  broadcast(event: string, message: any) {
    this.userPresenceGateway.namespace.emit(event, message)
  }

  sendToClient(clientId: string, event: string, message: any) {
    this.userPresenceGateway.namespace.to(clientId).emit(event, message)
  }

  async sendToUser(userId: number, event: string, message: any) {
    const sockets = await this.userSocketService.findSocketsByUserId(userId)
    if (!sockets) {
      this.logger.warn(`Couldnt find socket/s for user id: ${userId}`)
      return
    }
    sockets.forEach((socket) => {
      this.userPresenceGateway.namespace.to(socket).emit(event, message)
    })
  }

  sendWithAcknowledgment(
    clientId: string,
    event: string,
    message: any,
    callback: (response: any) => void
  ) {
    this.userPresenceGateway.namespace
      .to(clientId)
      .emit(event, message, callback)
  }

  disconnectClient(socketId: string) {
    const client = this.userPresenceGateway.namespace.sockets.get(socketId)
    client?.disconnect(true) // true forces disconnection
  }

  async disconnectUser(userId: number) {
    const sockets = await this.userSocketService.findSocketsByUserId(userId)
    sockets?.forEach((socket) => {
      const client = this.userPresenceGateway.namespace.sockets.get(socket)
      if (client) {
        client.disconnect(true)
      } else {
        this.logger.warn(`Couldnt find socket with id: ${socket}`)
      }
    })
  }

  async emitOnlineUsersToAdmins() {
    this.userPresenceGateway.namespace
      .to('admin-room')
      .emit('event:online-users', await this.onlineUsersService.getList())
  }
}
