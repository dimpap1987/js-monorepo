import { ZodPipe } from '@js-monorepo/nest/pipes'
import { Body, Controller, HttpCode, HttpStatus, Patch } from '@nestjs/common'
import { AppUserContext, AppUserContextType } from '../../../../decorators/app-user.decorator'
import { AppUserService } from './app-user.service'
import { UpdateAppUserDto, UpdateAppUserSchema } from './dto/app-user.dto'

@Controller('scheduling/app-users')
export class AppUserController {
  constructor(private readonly appUserService: AppUserService) {}

  /**
   * PATCH /scheduling/app-users/me
   * Update the current user's AppUser preferences
   * Note: GET /me is not needed as AppUser data is included in the session response
   */
  @Patch('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMe(
    @Body(new ZodPipe(UpdateAppUserSchema)) dto: UpdateAppUserDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    await this.appUserService.updateAppUser(appUserContext, dto)
  }
}
