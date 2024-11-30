import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { EditUserSchema } from '@js-monorepo/schemas'
import { EditUserDto, SessionUserType } from '@js-monorepo/types'
import { Body, Controller, Logger, Patch, UseGuards } from '@nestjs/common'
import { UserService } from './user.service'

@Controller('users')
@UseGuards(LoggedInGuard)
export class UserController {
  private logger = new Logger(UserController.name)

  constructor(private userService: UserService) {}

  @Patch()
  async editUser(
    @Body(new ZodPipe(EditUserSchema)) payload: EditUserDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    this.logger.log(`User profile update with user id: ${sessionUser.id}`)
    return this.userService.handleUserUpdate(
      payload,
      sessionUser.id,
      sessionUser.profile.id
    )
  }
}
