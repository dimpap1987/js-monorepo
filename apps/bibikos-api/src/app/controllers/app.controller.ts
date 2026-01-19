import { BibikosSession } from '@js-monorepo/types/session'
import { Controller, Get, Logger } from '@nestjs/common'
import { AppUser } from '../modules/scheduling/app-users/decorators/app-user.decorator'

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  @Get('session')
  async getSession(@AppUser() session: BibikosSession | null): Promise<BibikosSession | null> {
    return session
  }
}
