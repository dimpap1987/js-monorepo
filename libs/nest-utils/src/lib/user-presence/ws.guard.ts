import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { UserSocketService } from './services/user-socket.service'

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private userSocketService: UserSocketService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient()

    const user = this.userSocketService.getUserIdFromSocket(client)

    return !!user
  }
}
