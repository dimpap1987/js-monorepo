import { Controller, Get } from '@nestjs/common'
import { AppUserContext, AppUserContextType } from '../../../../decorators/app-user.decorator'
import { ParticipantService } from './participant.service'

@Controller('scheduling/participants')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  /**
   * GET /scheduling/participants/me
   * Get current user's participant profile (or null if not a participant yet)
   */
  @Get('me')
  async getMyParticipantProfile(@AppUserContext() appUserContext: AppUserContextType) {
    return this.participantService.getParticipantByAppUserId(appUserContext.appUserId)
  }
}
