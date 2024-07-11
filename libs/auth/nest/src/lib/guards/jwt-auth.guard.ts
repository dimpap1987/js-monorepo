import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TokensService } from '../services/tokens.service'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private tokenService: TokensService) {
    super()
  }

  override canActivate(context: ExecutionContext): boolean {
    const accessToken = context.switchToHttp().getRequest().cookies.accessToken
    try {
      const payload = this.tokenService.verifyAcessToken(accessToken)
      return !!payload
    } catch (error) {
      return false
    }
  }
}
