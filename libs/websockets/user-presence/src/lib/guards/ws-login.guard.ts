import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class WsLoginGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToWs().getClient()?.user?.id

    return !!user
  }
}
