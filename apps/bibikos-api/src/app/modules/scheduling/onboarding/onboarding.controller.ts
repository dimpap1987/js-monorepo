import { ZodPipe } from '@js-monorepo/nest/pipes'
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AppUserContext, AppUserContextType } from '../../../../decorators/app-user.decorator'
import { CompleteOnboardingDto, CompleteOnboardingSchema } from './dto/onboarding.dto'
import { OnboardingService } from './onboarding.service'

@Controller('scheduling/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * POST /scheduling/onboarding/complete
   * Complete onboarding: Create organizer, location, and class in one request
   */
  @Post('complete')
  @HttpCode(HttpStatus.CREATED)
  async completeOnboarding(
    @Body(new ZodPipe(CompleteOnboardingSchema)) dto: CompleteOnboardingDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    return this.onboardingService.completeOnboarding(appUserContext, dto)
  }
}
