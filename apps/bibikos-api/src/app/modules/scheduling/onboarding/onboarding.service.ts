import { Transactional } from '@nestjs-cls/transactional'
import { Injectable, Logger } from '@nestjs/common'
import { AppUserContextType } from '../../../../decorators/app-user.decorator'
import { ClassService } from '../classes/class.service'
import { LocationService } from '../locations/location.service'
import { OrganizerService } from '../organizers/organizer.service'
import { CompleteOnboardingDto } from './dto/onboarding.dto'

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name)

  constructor(
    private readonly organizerService: OrganizerService,
    private readonly locationService: LocationService,
    private readonly classService: ClassService
  ) {}

  /**
   * Complete onboarding: Create organizer, location, and class in a single transaction
   */
  @Transactional()
  async completeOnboarding(appUserContext: AppUserContextType, dto: CompleteOnboardingDto) {
    // Step 1: Create organizer profile
    const organizer = await this.organizerService.createOrGetOrganizer(appUserContext, dto.organizer)

    // Step 2: Create location
    const location = await this.locationService.createLocation(organizer.id, dto.location)

    // Step 3: Create class (with the location we just created)
    const classEntity = await this.classService.createClass(organizer.id, {
      ...dto.class,
      locationId: location.id,
    })

    // Step 4: Set this location as default for the organizer
    await this.organizerService.updateOrganizer(organizer.id, appUserContext.appUserId, {
      defaultLocationId: location.id,
    })

    this.logger.log(
      `Completed onboarding for appUser ${appUserContext.appUserId}: organizer ${organizer.id}, location ${location.id}, class ${classEntity.id}`
    )

    return {
      organizer,
      location,
      class: classEntity,
    }
  }
}
