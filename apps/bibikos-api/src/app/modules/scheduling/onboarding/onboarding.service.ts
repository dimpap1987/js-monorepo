import { ApiException } from '@js-monorepo/nest/exceptions'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { AppUserRepo, AppUserRepository } from '../app-users/app-user.repository'
import { ClassService } from '../classes/class.service'
import { LocationService } from '../locations/location.service'
import { OrganizerService } from '../organizers/organizer.service'
import { CompleteOnboardingDto } from './dto/onboarding.dto'

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name)

  constructor(
    @Inject(AppUserRepo)
    private readonly appUserRepo: AppUserRepository,
    private readonly organizerService: OrganizerService,
    private readonly locationService: LocationService,
    private readonly classService: ClassService
  ) {}

  /**
   * Complete onboarding: Create organizer, location, and class in a single transaction
   */
  @Transactional()
  async completeOnboarding(appUserId: number, dto: CompleteOnboardingDto) {
    // Verify app user exists
    const appUser = await this.appUserRepo.findById(appUserId)
    if (!appUser) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'APP_USER_NOT_FOUND')
    }

    // Step 1: Create organizer profile
    const organizer = await this.organizerService.createOrGetOrganizer(appUserId, dto.organizer)

    // Step 2: Create location
    const location = await this.locationService.createLocation(organizer.id, dto.location)

    // Step 3: Create class (with the location we just created)
    const classEntity = await this.classService.createClass(organizer.id, {
      ...dto.class,
      locationId: location.id,
    })

    // Step 4: Set this location as default for the organizer
    await this.organizerService.updateOrganizer(organizer.id, appUserId, {
      defaultLocationId: location.id,
    })

    this.logger.log(
      `Completed onboarding for appUser ${appUserId}: organizer ${organizer.id}, location ${location.id}, class ${classEntity.id}`
    )

    return {
      organizer,
      location,
      class: classEntity,
    }
  }
}
