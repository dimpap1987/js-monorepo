import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { SessionUserType } from '@js-monorepo/types/auth'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { AppUserService } from '../app-users/app-user.service'
import { CreateOrganizerDto, CreateOrganizerSchema, UpdateOrganizerDto, UpdateOrganizerSchema } from './dto/organizer.dto'
import { OrganizerService } from './organizer.service'

@Controller('scheduling/organizers')
export class OrganizerController {
  constructor(
    private readonly organizerService: OrganizerService,
    private readonly appUserService: AppUserService
  ) {}

  /**
   * GET /scheduling/organizers/me
   * Get the current user's organizer profile
   */
  @Get('me')
  @UseGuards(LoggedInGuard)
  async getMyOrganizerProfile(@SessionUser() sessionUser: SessionUserType) {
    const appUser = await this.appUserService.getOrCreateAppUser(sessionUser.id)
    return this.organizerService.getOrganizerByAppUserId(appUser.id)
  }

  /**
   * POST /scheduling/organizers
   * Create (or get) organizer profile for current user
   * This makes the user an "organizer" who can create classes
   */
  @Post()
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.CREATED)
  async createOrganizerProfile(
    @Body(new ZodPipe(CreateOrganizerSchema)) dto: CreateOrganizerDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    const appUser = await this.appUserService.getOrCreateAppUser(sessionUser.id)
    return this.organizerService.createOrGetOrganizer(appUser.id, dto)
  }

  /**
   * PATCH /scheduling/organizers/me
   * Update current user's organizer profile
   */
  @Patch('me')
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.OK)
  async updateMyOrganizerProfile(
    @Body(new ZodPipe(UpdateOrganizerSchema)) dto: UpdateOrganizerDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    const appUser = await this.appUserService.getOrCreateAppUser(sessionUser.id)
    const organizer = await this.organizerService.getOrganizerByAppUserId(appUser.id)

    if (!organizer) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ORGANIZER_PROFILE_NOT_FOUND')
    }

    return this.organizerService.updateOrganizer(organizer.id, appUser.id, dto)
  }

  /**
   * GET /scheduling/organizers/slug-check?slug=john-doe
   * Check if a slug is available
   */
  @Get('slug-check')
  @UseGuards(LoggedInGuard)
  async checkSlugAvailability(
    @Query('slug') slug: string,
    @SessionUser() sessionUser: SessionUserType
  ) {
    if (!slug || slug.length < 3) {
      return { available: false, reason: 'Slug must be at least 3 characters' }
    }

    const appUser = await this.appUserService.getOrCreateAppUser(sessionUser.id)
    const organizer = await this.organizerService.getOrganizerByAppUserId(appUser.id)

    const available = await this.organizerService.checkSlugAvailability(slug, organizer?.id)
    return { available }
  }

  /**
   * GET /scheduling/organizers/public/:slug
   * Get public organizer profile (for /coach/:slug page)
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
}
