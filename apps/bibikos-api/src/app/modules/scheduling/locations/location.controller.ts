import { ApiException } from '@js-monorepo/nest/exceptions'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { AppUserContext, AppUserContextType } from '../../../../decorators/app-user.decorator'
import { AppUserService } from '../app-users/app-user.service'
import { OrganizerService } from '../organizers/organizer.service'
import { CreateLocationDto, CreateLocationSchema, UpdateLocationDto, UpdateLocationSchema } from './dto/location.dto'
import { LocationService } from './location.service'

@Controller('scheduling/locations')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly organizerService: OrganizerService,
    private readonly appUserService: AppUserService
  ) {}

  /**
   * Helper to get organizer ID for current user
   */
  private async getOrganizerId(appUserContext: AppUserContextType): Promise<number> {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    return appUserContext.organizerId
  }

  /**
   * GET /scheduling/locations
   * List all locations for current organizer
   */
  @Get()
  async listLocations(
    @AppUserContext() appUserContext: AppUserContextType,
    @Query('includeInactive') includeInactive?: string
  ) {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.locationService.getLocationsByOrganizer(organizerId, includeInactive === 'true')
  }

  /**
   * GET /scheduling/locations/:id
   * Get a specific location
   */
  @Get(':id')
  async getLocation(@Param('id', ParseIntPipe) id: number, @AppUserContext() appUserContext: AppUserContextType) {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.locationService.getLocation(id, organizerId)
  }

  /**
   * POST /scheduling/locations
   * Create a new location
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createLocation(
    @Body(new ZodPipe(CreateLocationSchema)) dto: CreateLocationDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.locationService.createLocation(organizerId, dto)
  }

  /**
   * PATCH /scheduling/locations/:id
   * Update a location
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(UpdateLocationSchema)) dto: UpdateLocationDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.locationService.updateLocation(id, organizerId, dto)
  }

  /**
   * DELETE /scheduling/locations/:id
   * Soft delete (deactivate) a location
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLocation(@Param('id', ParseIntPipe) id: number, @AppUserContext() appUserContext: AppUserContextType) {
    const organizerId = await this.getOrganizerId(appUserContext)
    await this.locationService.deactivateLocation(id, organizerId)
  }
}
