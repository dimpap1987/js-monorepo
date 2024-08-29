import { AuthGuard } from '@nestjs/passport'

export class AuthGoogle extends AuthGuard('google') {
  constructor() {
    super({
      prompt: 'select_account',
    })
  }
}
