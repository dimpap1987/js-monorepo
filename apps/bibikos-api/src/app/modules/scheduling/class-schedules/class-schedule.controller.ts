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
  constructor(private readonly scheduleService: ClassScheduleService) {}

  /**
   * GET /scheduling/schedules/discover
   * Public endpoint to discover classes across all organizers
   * Uses cursor-based pagination for virtual scrolling
   * No auth required, but if logged in shows user's booking status and private classes with accepted invitations
   */
  @Get('discover')
  async discoverSchedules(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('activity') activity?: string,
    @Query('timeOfDay') timeOfDay?: 'morning' | 'afternoon' | 'evening',
    @Query('search') search?: string,
    @AppUserContext() appUserContext?: AppUserContextType
  ) {
    const parsedCursor = cursor ? parseInt(cursor, 10) : null
    const parsedLimit = limit ? parseInt(limit, 10) : 15

    // Validate cursor if provided
    if (cursor && (isNaN(parsedCursor!) || parsedCursor! < 1)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'INVALID_CURSOR')
    }

    // Validate limit
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'INVALID_LIMIT')
    }

    return this.scheduleService.discoverSchedulesByCursor(
      {
        activity,
        timeOfDay,
        search,
      },
      parsedCursor,
      parsedLimit,
      appUserContext?.participantId,
      appUserContext?.appUserId
    )
  }

  /**
   * GET /scheduling/schedules/calendar
   * Get schedules for calendar view
   * For bookings view, include cancelled schedules that have bookings
   */
  @Get('calendar')
  async getCalendarSchedules(
    @AppUserContext() appUserContext: AppUserContextType,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('classId') classId?: string,
    @Query('includeCancelledWithBookings') includeCancelledWithBookings?: string
  ) {
    if (!startDate || !endDate) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'START_AND_END_DATE_REQUIRED')
    }

    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }

    return this.scheduleService.getSchedulesForCalendar(
      appUserContext.organizerId,
      startDate,
      endDate,
      classId ? parseInt(classId, 10) : undefined,
      includeCancelledWithBookings === 'true'
    )
  }

  /**
   * GET /scheduling/schedules/class/:classId/upcoming
   * Get upcoming schedules for a class
   */
  @Get('class/:classId/upcoming')
  async getUpcomingSchedules(
    @AppUserContext() appUserContext: AppUserContextType,
    @Param('classId', ParseIntPipe) classId: number,
    @Query('limit') limit?: string
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    return this.scheduleService.getUpcomingSchedules(
      classId,
      appUserContext.organizerId,
      limit ? parseInt(limit, 10) : 10
    )
  }

  /**
   * GET /scheduling/schedules/:id
   * Get a specific schedule (organizer view)
   */
  @Get(':id')
  async getSchedule(@AppUserContext() appUserContext: AppUserContextType, @Param('id', ParseIntPipe) id: number) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    return this.scheduleService.getSchedule(id, appUserContext.organizerId)
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
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(
    @Body(new ZodPipe(CreateClassScheduleSchema)) dto: CreateClassScheduleDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    return this.scheduleService.createSchedule(appUserContext.organizerId, dto)
  }

  /**
   * PATCH /scheduling/schedules/:id
   * Update a schedule (single occurrence)
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(UpdateClassScheduleSchema)) dto: UpdateClassScheduleDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    return this.scheduleService.updateSchedule(id, appUserContext.organizerId, dto)
  }

  /**
   * POST /scheduling/schedules/:id/cancel
   * Cancel a schedule
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(CancelClassScheduleSchema)) dto: CancelClassScheduleDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    await this.scheduleService.cancelSchedule(id, appUserContext.organizerId, dto)
    return { success: true }
  }

  /**
   * DELETE /scheduling/schedules/:id/future
   * Delete future occurrences of a recurring schedule
   */
  @Delete(':id/future')
  @HttpCode(HttpStatus.OK)
  async deleteFutureOccurrences(
    @Param('id', ParseIntPipe) id: number,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    const deleted = await this.scheduleService.deleteFutureOccurrences(id, appUserContext.organizerId)
    return { deleted }
  }

  /**
   * POST /scheduling/schedules/:id/cancel-series
   * Cancel this schedule and all future schedules in the recurring series
   * Notifies all affected participants
   */
  @Post(':id/cancel-series')
  @HttpCode(HttpStatus.OK)
  async cancelFutureSchedules(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(CancelClassScheduleSchema)) dto: CancelClassScheduleDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    return this.scheduleService.cancelFutureSchedules(id, appUserContext.organizerId, dto)
  }
}
