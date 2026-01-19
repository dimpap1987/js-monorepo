import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { SessionUserType } from '@js-monorepo/types/auth'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { AppUserService } from '../app-users/app-user.service'
import { ParticipantService } from './participant.service'

@Controller('scheduling/participants')
@UseGuards(LoggedInGuard)
export class ParticipantController {
  constructor(
    private readonly participantService: ParticipantService,
    private readonly appUserService: AppUserService
  ) {}

  /**
   * GET /scheduling/participants/me
   * Get current user's participant profile (or null if not a participant yet)
   */
  @Get('me')
  async getMyParticipantProfile(@SessionUser() sessionUser: SessionUserType) {
    const appUser = await this.appUserService.getOrCreateAppUserByAuthId(sessionUser.id)
    return this.participantService.getParticipantByAppUserId(appUser.id)
  }
}
