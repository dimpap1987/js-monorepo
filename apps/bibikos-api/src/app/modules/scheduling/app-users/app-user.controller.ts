import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { SessionUserType } from '@js-monorepo/types/auth'
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common'
import { AppUserService } from './app-user.service'
import { UpdateAppUserDto, UpdateAppUserSchema } from './dto/app-user.dto'

@Controller('scheduling/app-users')
@UseGuards(LoggedInGuard)
export class AppUserController {
  constructor(private readonly appUserService: AppUserService) {}

  /**
   * GET /scheduling/app-users/me
   * Get or create the current user's AppUser profile
   */
  @Get('me')
  async getOrCreateMe(@SessionUser() sessionUser: SessionUserType) {
    return this.appUserService.getOrCreateAppUser(sessionUser.id)
  }

  /**
   * PATCH /scheduling/app-users/me
   * Update the current user's AppUser preferences
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
