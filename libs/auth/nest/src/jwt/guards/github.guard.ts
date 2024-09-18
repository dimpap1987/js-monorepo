import { AuthGuard } from '@nestjs/passport'

export class AuthGithub extends AuthGuard('github') {
  constructor() {
    super({
      prompt: 'select_account',
    })
  }
}
