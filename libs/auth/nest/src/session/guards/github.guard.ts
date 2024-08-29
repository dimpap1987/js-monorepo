import { ExecutionContext, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request, Response } from 'express'

export class AuthGithub extends AuthGuard('github') {
  private readonly logger = new Logger(AuthGithub.name)

  constructor() {
    super({
      prompt: 'select_account',
    })
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    try {
      const result = await super.canActivate(context)
      const exists = await this.handleLogin(request, response)
      if (result && exists) {
        await super.logIn(request)
      }
    } catch (error) {
      this.logger.error(null, error)
    }

    return true
  }

  private async handleLogin(req: Request, res: Response): Promise<boolean> {
    const user = req.user

    if (user?.unRegisteredUser) {
      res.cookie('UNREGISTERED-USER', user.unRegisteredUser.token, {
        httpOnly: true,
      })
      return false
    } else {
      return true
    }
  }
}
