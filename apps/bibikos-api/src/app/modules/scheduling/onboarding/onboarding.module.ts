import { Module } from '@nestjs/common'
import { AppUserModule } from '../app-users/app-user.module'
import { ClassModule } from '../classes/class.module'
import { LocationModule } from '../locations/location.module'
import { OrganizerModule } from '../organizers/organizer.module'
import { OnboardingController } from './onboarding.controller'
import { OnboardingService } from './onboarding.service'

@Module({
  imports: [AppUserModule, OrganizerModule, LocationModule, ClassModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
