import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from '../services/auth.service'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private authService: AuthService) {
    super()
  }

  override canActivate(context: ExecutionContext): boolean {
    const accessToken = context.switchToHttp().getRequest().cookies.accessToken
    try {
      const payload = this.authService.verify(accessToken)
      return !!payload
    } catch (error) {
      return false
    }
  }
}
