import { Injectable } from '@nestjs/common'
import { UserPresenceGateway } from '../gateway/user-presence.gateway'

@Injectable()
export class UserPresenceWebsocketService {
  constructor(private readonly userPresenceGateway: UserPresenceGateway) {}

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
    if (client) {
      client.disconnect(true) // true forces disconnection
    }
  }
}
