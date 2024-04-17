import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtPayload, RolesEnum } from '../types/auth.configuration'
import { AuthService } from '../services/auth.service'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: AuthService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    )
    if (!requiredRoles) return true

    const accessToken = context.switchToHttp().getRequest().cookies.accessToken
    const payload = this.jwtService.verify(accessToken) as JwtPayload

    return requiredRoles.some((role) => payload.user?.roles?.includes(role))
  }
}
