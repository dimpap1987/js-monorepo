import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { SessionUserType } from '@js-monorepo/types/auth'
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { AppUserService } from '../app-users/app-user.service'
import { CompleteOnboardingDto, CompleteOnboardingSchema } from './dto/onboarding.dto'
import { OnboardingService } from './onboarding.service'

@Controller('scheduling/onboarding')
@UseGuards(LoggedInGuard)
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly appUserService: AppUserService
  ) {}

  /**
   * POST /scheduling/onboarding/complete
   * Complete onboarding: Create organizer, location, and class in one request
   */
  @Post('complete')
  @HttpCode(HttpStatus.CREATED)
  async completeOnboarding(
    @Body(new ZodPipe(CompleteOnboardingSchema)) dto: CompleteOnboardingDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    const appUser = await this.appUserService.getOrCreateAppUser(sessionUser.id)
    return this.onboardingService.completeOnboarding(appUser.id, dto)
  }
}
