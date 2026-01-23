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
import { ClassService } from './class.service'
import { CreateClassDto, CreateClassSchema, UpdateClassDto, UpdateClassSchema } from './dto/class.dto'

@Controller('scheduling/classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  /**
   * Helper to get organizer ID for current user
   */
  private async getOrganizerId(appUserContext: AppUserContextType): Promise<number> {
    if (!appUserContext?.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    return appUserContext.organizerId
  }

  /**
   * GET /scheduling/classes
   * List all classes for current organizer
   */
  @Get()
  async listClasses(
    @AppUserContext() appUserContext?: AppUserContextType,
    @Query('includeInactive') includeInactive?: string
  ) {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.classService.getClassesByOrganizer(organizerId, includeInactive === 'true')
  }

  /**
   * GET /scheduling/classes/:id
   * Get a specific class (organizer view)
   */
  @Get(':id')
  async getClass(@Param('id', ParseIntPipe) id: number, @AppUserContext() appUserContext?: AppUserContextType) {
    const organizerId = await this.getOrganizerId(appUserContext)
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
  async getClassView(@Param('id', ParseIntPipe) id: number, @AppUserContext() appUserContext?: AppUserContextType) {
    return this.classService.getClassView(id, appUserContext?.appUserId)
  }

  /**
   * POST /scheduling/classes
   * Create a new class
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createClass(
    @Body(new ZodPipe(CreateClassSchema)) dto: CreateClassDto,
    @AppUserContext() appUserContext?: AppUserContextType
  ) {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.classService.createClass(organizerId, dto)
  }

  /**
   * PATCH /scheduling/classes/:id
   * Update a class
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateClass(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(UpdateClassSchema)) dto: UpdateClassDto,
    @AppUserContext() appUserContext?: AppUserContextType
  ) {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.classService.updateClass(id, organizerId, dto)
  }

  /**
   * DELETE /scheduling/classes/:id
   * Soft delete (deactivate) a class
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClass(@Param('id', ParseIntPipe) id: number, @AppUserContext() appUserContext?: AppUserContextType) {
    const organizerId = await this.getOrganizerId(appUserContext)
    await this.classService.deactivateClass(id, organizerId)
  }
}
