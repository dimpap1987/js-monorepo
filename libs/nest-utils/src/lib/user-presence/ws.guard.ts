import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { UserPresenceService } from './user-presence.service'

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private userPresenceService: UserPresenceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient()

    const user = this.userPresenceService.getUserIdFromSocket(client)

    return !!user
  }
}
