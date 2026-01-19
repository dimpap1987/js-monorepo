import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { SessionUserType } from '@js-monorepo/types/auth'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { AppUserService } from '../app-users/app-user.service'
import { OrganizerService } from '../organizers/organizer.service'
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
@UseGuards(LoggedInGuard)
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly participantService: ParticipantService,
    private readonly organizerService: OrganizerService,
    private readonly appUserService: AppUserService
  ) {}

  /**
   * Helper to get participant ID (creates if needed)
   */
  private async getOrCreateParticipantId(sessionUser: SessionUserType): Promise<number> {
    const appUser = await this.appUserService.getOrCreateAppUserByAuthId(sessionUser.id)
    const participant = await this.participantService.getOrCreateParticipant(appUser.id)
    return participant.id
  }

  /**
   * Helper to get organizer ID
   */
  private async getOrganizerId(sessionUser: SessionUserType): Promise<number> {
    const appUser = await this.appUserService.getOrCreateAppUserByAuthId(sessionUser.id)
    const organizer = await this.organizerService.getOrganizerByAppUserId(appUser.id)

    if (!organizer) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'NOT_AN_ORGANIZER')
    }

    return organizer.id
  }

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
    @SessionUser() sessionUser: SessionUserType
  ) {
    const participantId = await this.getOrCreateParticipantId(sessionUser)
    return this.bookingService.createBooking(participantId, dto.classScheduleId)
  }

  /**
   * GET /scheduling/bookings/my
   * Get current user's bookings
   */
  @Get('my')
  async getMyBookings(@SessionUser() sessionUser: SessionUserType) {
    const appUser = await this.appUserService.getOrCreateAppUserByAuthId(sessionUser.id)
    const participant = await this.participantService.getParticipantByAppUserId(appUser.id)

    if (!participant) {
      return { upcoming: [], past: [] }
    }

    return this.bookingService.getMyBookings(participant.id)
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
    @SessionUser() sessionUser: SessionUserType
  ) {
    const participantId = await this.getOrCreateParticipantId(sessionUser)
    await this.bookingService.cancelBooking(id, participantId, dto)
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
    @SessionUser() sessionUser: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.bookingService.getBookingsForSchedule(scheduleId, organizerId)
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
    @SessionUser() sessionUser: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser)
    await this.bookingService.cancelBookingByOrganizer(id, organizerId, dto)
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
    @SessionUser() sessionUser: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser)
    const updated = await this.bookingService.markAttendance(organizerId, dto)
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
    @SessionUser() sessionUser: SessionUserType
  ) {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.bookingService.updateBookingNotes(id, organizerId, dto)
  }
}
