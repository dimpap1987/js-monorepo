import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RolesEnum } from '../../common/types'
import { TokensService } from '../services/tokens.service'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokenService: TokensService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    )
    if (!requiredRoles) return true

    const accessToken = context.switchToHttp().getRequest().cookies.accessToken
    const payload = this.tokenService.verifyAcessToken(accessToken) as any

    return requiredRoles.some((role) => payload?.user?.roles?.includes(role))
  }
}
