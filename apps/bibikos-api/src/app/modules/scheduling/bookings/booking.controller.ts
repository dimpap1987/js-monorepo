import { ApiException } from '@js-monorepo/nest/exceptions'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common'
import { AppUserContext, AppUserContextType } from '../../../../decorators/app-user.decorator'
import { ParticipantService } from '../participants/participant.service'
import { BookingService } from './booking.service'
import {
  CancelBookingDto,
  CancelBookingSchema,
  CreateBookingDto,
  CreateBookingSchema,
  MarkAttendanceDto,
  MarkAttendanceSchema,
  UpdateBookingNotesDto,
  UpdateBookingNotesSchema,
} from './dto/booking.dto'

@Controller('scheduling/bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly participantService: ParticipantService
  ) {}

  // ============================================
  // PARTICIPANT ENDPOINTS
  // ============================================

  /**
   * POST /scheduling/bookings
   * Book a class
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body(new ZodPipe(CreateBookingSchema)) dto: CreateBookingDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    const participant = await this.participantService.getOrCreateParticipant(appUserContext)
    return this.bookingService.createBooking(participant.id, dto.classScheduleId)
  }

  /**
   * GET /scheduling/bookings/my
   * Get current user's bookings
   */
  @Get('my')
  async getMyBookings(@AppUserContext() appUserContext: AppUserContextType) {
    if (!appUserContext.participantId) {
      return { upcoming: [], past: [] }
    }

    return this.bookingService.getMyBookings(appUserContext.participantId)
  }

  /**
   * POST /scheduling/bookings/:id/cancel
   * Cancel a booking (participant)
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(CancelBookingSchema)) dto: CancelBookingDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.participantId) {
      return { success: false }
    }
    await this.bookingService.cancelBooking(id, appUserContext.participantId, dto)
    return { success: true }
  }

  // ============================================
  // ORGANIZER ENDPOINTS
  // ============================================

  /**
   * GET /scheduling/bookings/schedule/:scheduleId
   * Get all bookings for a schedule (organizer view)
   */
  @Get('schedule/:scheduleId')
  async getBookingsForSchedule(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    return this.bookingService.getBookingsForSchedule(scheduleId, appUserContext.organizerId)
  }

  /**
   * POST /scheduling/bookings/:id/cancel-by-organizer
   * Cancel a booking (organizer)
   */
  @Post(':id/cancel-by-organizer')
  @HttpCode(HttpStatus.OK)
  async cancelBookingByOrganizer(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(CancelBookingSchema)) dto: CancelBookingDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    await this.bookingService.cancelBookingByOrganizer(id, appUserContext.organizerId, dto)
    return { success: true }
  }

  /**
   * POST /scheduling/bookings/attendance
   * Mark attendance for multiple bookings
   */
  @Post('attendance')
  @HttpCode(HttpStatus.OK)
  async markAttendance(
    @Body(new ZodPipe(MarkAttendanceSchema)) dto: MarkAttendanceDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    const updated = await this.bookingService.markAttendance(appUserContext.organizerId, dto)
    return { updated }
  }

  /**
   * PATCH /scheduling/bookings/:id/notes
   * Update organizer notes on a booking
   */
  @Patch(':id/notes')
  @HttpCode(HttpStatus.OK)
  async updateBookingNotes(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(UpdateBookingNotesSchema)) dto: UpdateBookingNotesDto,
    @AppUserContext() appUserContext: AppUserContextType
  ) {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }
    return this.bookingService.updateBookingNotes(id, appUserContext.organizerId, dto)
  }
}
