import { ApiException } from '@js-monorepo/nest/exceptions'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import {
  Body,
  Controller,
  forwardRef,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { AppUserContext, AppUserContextType } from '../../../../decorators/app-user.decorator'
import { ClassScheduleService } from '../class-schedules/class-schedule.service'
import {
  CreateOrganizerDto,
  CreateOrganizerSchema,
  UpdateOrganizerDto,
  UpdateOrganizerSchema,
} from './dto/organizer.dto'
import { OrganizerService } from './organizer.service'

@Controller('scheduling/organizers')
export class OrganizerController {
  constructor(
    private readonly organizerService: OrganizerService,
    @Inject(forwardRef(() => ClassScheduleService))
    private readonly scheduleService: ClassScheduleService
  ) {}

  /**
   * GET /scheduling/organizers/me
   * Get the current user's organizer profile
   */
  @Get('me')
  async getMyOrganizerProfile(@AppUserContext() appUserContext: AppUserContextType) {
    return this.organizerService.findById(appUserContext.organizerId)
  }

  /**
   * POST /scheduling/organizers
   * Create (or get) organizer profile for current user
   * This makes the user an "organizer" who can create classes
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrganizerProfile(
    @Body(new ZodPipe(CreateOrganizerSchema)) dto: CreateOrganizerDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    return this.organizerService.createOrGetOrganizer(appUserContext, dto)
  }

  /**
   * PATCH /scheduling/organizers/me
   * Update current user's organizer profile
   */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMyOrganizerProfile(
    @Body(new ZodPipe(UpdateOrganizerSchema)) dto: UpdateOrganizerDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ORGANIZER_PROFILE_NOT_FOUND')
    }

    return this.organizerService.updateOrganizer(appUserContext, dto)
  }

  /**
   * GET /scheduling/organizers/slug-check?slug=john-doe
   * Check if a slug is available
   */
  @Get('slug-check')
  async checkSlugAvailability(@Query('slug') slug: string, @AppUserContext() appUserContext: AppUserContextType) {
    if (!slug || slug.length < 3) {
      return { available: false, reason: 'Slug must be at least 3 characters' }
    }

    const available = await this.organizerService.checkSlugAvailability(slug, appUserContext?.organizerId)
    return { available }
  }

  /**
   * GET /scheduling/organizers/public/:slug
   * Get public organizer profile (for /instructor/:slug page)
   * No auth required
   */
  @Get('public/:slug')
  async getPublicProfile(@Param('slug') slug: string) {
    const profile = await this.organizerService.getPublicProfile(slug)

    if (!profile) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ORGANIZER_NOT_FOUND')
    }

    return profile
  }

  /**
   * GET /scheduling/organizers/public/:slug/schedules
   * Get public schedules for an organizer (for /instructor/:slug booking page)
   * No auth required, but if logged in, includes user's booking status
   */
  @Get('public/:slug/schedules')
  async getPublicSchedules(
    @Param('slug') slug: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @AppUserContext() appUserContext?: AppUserContextType
  ) {
    if (!startDate || !endDate) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'START_AND_END_DATE_REQUIRED')
    }

    return this.scheduleService.getPublicSchedulesBySlug(slug, startDate, endDate, appUserContext?.participantId)
  }
}
