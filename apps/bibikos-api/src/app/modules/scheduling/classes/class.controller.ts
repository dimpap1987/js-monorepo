import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { SessionUserType } from '@js-monorepo/types/auth'
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
  UseGuards,
} from '@nestjs/common'
import { AppUserService } from '../app-users/app-user.service'
import { OrganizerService } from '../organizers/organizer.service'
import { ClassService } from './class.service'
import { CreateClassDto, CreateClassSchema, UpdateClassDto, UpdateClassSchema } from './dto/class.dto'

@Controller('scheduling/classes')
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly organizerService: OrganizerService,
    private readonly appUserService: AppUserService
  ) {}

  /**
   * Helper to get organizer ID for current user
   */
  private async getOrganizerId(sessionUser: SessionUserType): Promise<number> {
    const appUser = await this.appUserService.getOrCreateAppUser(sessionUser.id)
    const organizer = await this.organizerService.getOrganizerByAppUserId(appUser.id)

    if (!organizer) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }

    return organizer.id
  }

  /**
   * GET /scheduling/classes
   * List all classes for current organizer
   */
  @Get()
  @UseGuards(LoggedInGuard)
  async listClasses(@SessionUser() sessionUser: SessionUserType, @Query('includeInactive') includeInactive?: string) {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.classService.getClassesByOrganizer(organizerId, includeInactive === 'true')
  }

  /**
   * GET /scheduling/classes/:id
   * Get a specific class (organizer view)
   */
  @Get(':id')
  @UseGuards(LoggedInGuard)
  async getClass(@Param('id', ParseIntPipe) id: number, @SessionUser() sessionUser: SessionUserType) {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.classService.getClass(id, organizerId)
  }

  /**
   * GET /scheduling/classes/:id/public
   * Get class for public view (booking page)
   * No auth required
   */
  @Get(':id/public')
  async getClassPublic(@Param('id', ParseIntPipe) id: number) {
    const classEntity = await this.classService.getClassPublic(id)

    if (!classEntity) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND')
    }

    return classEntity
  }

  /**
   * GET /scheduling/classes/:id/view
   * Get class with schedules for booking page
   * No auth required for public classes, but requires accepted invitation for private classes
   */
  @Get(':id/view')
  async getClassView(@Param('id', ParseIntPipe) id: number, @SessionUser() sessionUser?: SessionUserType) {
    let userId: number | undefined

    // Get user ID if logged in
    if (sessionUser?.id) {
      try {
        const appUser = await this.appUserService.getOrCreateAppUser(sessionUser.id)
        userId = appUser.id
      } catch {
        // User not found, continue without user ID
      }
    }

    return this.classService.getClassView(id, userId)
  }

  /**
   * POST /scheduling/classes
   * Create a new class
   */
  @Post()
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.CREATED)
  async createClass(
    @Body(new ZodPipe(CreateClassSchema)) dto: CreateClassDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.classService.createClass(organizerId, dto)
  }

  /**
   * PATCH /scheduling/classes/:id
   * Update a class
   */
  @Patch(':id')
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.OK)
  async updateClass(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(UpdateClassSchema)) dto: UpdateClassDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.classService.updateClass(id, organizerId, dto)
  }

  /**
   * DELETE /scheduling/classes/:id
   * Soft delete (deactivate) a class
   */
  @Delete(':id')
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClass(@Param('id', ParseIntPipe) id: number, @SessionUser() sessionUser: SessionUserType) {
    const organizerId = await this.getOrganizerId(sessionUser)
    await this.classService.deactivateClass(id, organizerId)
  }
}
