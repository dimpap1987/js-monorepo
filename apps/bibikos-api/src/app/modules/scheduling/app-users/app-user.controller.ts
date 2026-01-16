import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { SessionUserType } from '@js-monorepo/types/auth'
import { Body, Controller, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common'
import { AppUserService } from './app-user.service'
import { UpdateAppUserDto, UpdateAppUserSchema } from './dto/app-user.dto'

@Controller('scheduling/app-users')
@UseGuards(LoggedInGuard)
export class AppUserController {
  constructor(private readonly appUserService: AppUserService) {}

  /**
   * PATCH /scheduling/app-users/me
   * Update the current user's AppUser preferences
   * Note: GET /me is not needed as AppUser data is included in the session response
   */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMe(
    @Body(new ZodPipe(UpdateAppUserSchema)) dto: UpdateAppUserDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    return this.appUserService.updateAppUser(sessionUser.id, dto)
  }
}
