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
import { ParticipantService } from '../participants/participant.service'
import { ClassScheduleService } from './class-schedule.service'
import {
  CancelClassScheduleDto,
  CancelClassScheduleSchema,
  CreateClassScheduleDto,
  CreateClassScheduleSchema,
  UpdateClassScheduleDto,
  UpdateClassScheduleSchema,
} from './dto/class-schedule.dto'

@Controller('scheduling/schedules')
export class ClassScheduleController {
  constructor(
    private readonly scheduleService: ClassScheduleService,
    private readonly organizerService: OrganizerService,
    private readonly appUserService: AppUserService,
    private readonly participantService: ParticipantService
  ) {}

  /**
   * GET /scheduling/schedules/discover
   * Public endpoint to discover classes across all organizers
   * No auth required, but if logged in shows user's booking status
   */
  @Get('discover')
  async discoverSchedules(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('activity') activity?: string,
    @Query('timeOfDay') timeOfDay?: 'morning' | 'afternoon' | 'evening',
    @Query('search') search?: string,
    @SessionUser() sessionUser?: SessionUserType
  ) {
    if (!startDate || !endDate) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'START_AND_END_DATE_REQUIRED')
    }

    // Get participant ID if user is logged in
    let participantId: number | undefined
    if (sessionUser?.id) {
      const appUser = await this.appUserService.getOrCreateAppUser(sessionUser.id)
      const participant = await this.participantService.getParticipantByAppUserId(appUser.id)
      participantId = participant?.id
    }

    return this.scheduleService.discoverSchedules(
      {
        startDate,
        endDate,
        activity,
        timeOfDay,
        search,
      },
      participantId
    )
  }

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
   * GET /scheduling/schedules/calendar
   * Get schedules for calendar view
   */
  @Get('calendar')
  @UseGuards(LoggedInGuard)
  async getCalendarSchedules(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('classId') classId?: string,
    @SessionUser() sessionUser?: SessionUserType
  ) {
    if (!startDate || !endDate) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'START_AND_END_DATE_REQUIRED')
    }

    const organizerId = await this.getOrganizerId(sessionUser!)
    return this.scheduleService.getSchedulesForCalendar(
      organizerId,
      startDate,
      endDate,
      classId ? parseInt(classId, 10) : undefined
    )
  }

  /**
   * GET /scheduling/schedules/class/:classId/upcoming
   * Get upcoming schedules for a class
   */
  @Get('class/:classId/upcoming')
  @UseGuards(LoggedInGuard)
  async getUpcomingSchedules(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('limit') limit?: string,
    @SessionUser() sessionUser?: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser!)
    return this.scheduleService.getUpcomingSchedules(classId, organizerId, limit ? parseInt(limit, 10) : 10)
  }

  /**
   * GET /scheduling/schedules/:id
   * Get a specific schedule (organizer view)
   */
  @Get(':id')
  @UseGuards(LoggedInGuard)
  async getSchedule(@Param('id', ParseIntPipe) id: number, @SessionUser() sessionUser: SessionUserType) {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.scheduleService.getSchedule(id, organizerId)
  }

  /**
   * GET /scheduling/schedules/:id/public
   * Get schedule for public view (booking page)
   * No auth required
   */
  @Get(':id/public')
  async getSchedulePublic(@Param('id', ParseIntPipe) id: number) {
    const schedule = await this.scheduleService.getSchedulePublic(id)

    if (!schedule) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'SCHEDULE_NOT_FOUND')
    }

    return schedule
  }

  /**
   * POST /scheduling/schedules
   * Create a new schedule (one-time or recurring)
   */
  @Post()
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(
    @Body(new ZodPipe(CreateClassScheduleSchema)) dto: CreateClassScheduleDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.scheduleService.createSchedule(organizerId, dto)
  }

  /**
   * PATCH /scheduling/schedules/:id
   * Update a schedule (single occurrence)
   */
  @Patch(':id')
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.OK)
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(UpdateClassScheduleSchema)) dto: UpdateClassScheduleDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.scheduleService.updateSchedule(id, organizerId, dto)
  }

  /**
   * POST /scheduling/schedules/:id/cancel
   * Cancel a schedule
   */
  @Post(':id/cancel')
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.OK)
  async cancelSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(CancelClassScheduleSchema)) dto: CancelClassScheduleDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser)
    await this.scheduleService.cancelSchedule(id, organizerId, dto)
    return { success: true }
  }

  /**
   * DELETE /scheduling/schedules/:id/future
   * Delete future occurrences of a recurring schedule
   */
  @Delete(':id/future')
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.OK)
  async deleteFutureOccurrences(@Param('id', ParseIntPipe) id: number, @SessionUser() sessionUser: SessionUserType) {
    const organizerId = await this.getOrganizerId(sessionUser)
    const deleted = await this.scheduleService.deleteFutureOccurrences(id, organizerId)
    return { deleted }
  }

  /**
   * POST /scheduling/schedules/:id/cancel-series
   * Cancel this schedule and all future schedules in the recurring series
   * Notifies all affected participants
   */
  @Post(':id/cancel-series')
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.OK)
  async cancelFutureSchedules(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(CancelClassScheduleSchema)) dto: CancelClassScheduleDto,
    @SessionUser() sessionUser: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.scheduleService.cancelFutureSchedules(id, organizerId, dto)
  }
}
