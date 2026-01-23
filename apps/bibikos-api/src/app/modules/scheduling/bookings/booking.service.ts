import { BookingStatus } from '@js-monorepo/bibikos-db'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { Events, Rooms, UserPresenceWebsocketService } from '@js-monorepo/user-presence'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ClassScheduleService } from '../class-schedules'
import { ClassScheduleWithClass } from '../class-schedules/class-schedule.repository'
import { BookingRepo, BookingRepository, BookingWithParticipant, BookingWithSchedule } from './booking.repository'
import {
  BookingListResponseDto,
  BookingResponseDto,
  CancelBookingDto,
  MarkAttendanceDto,
  MyBookingsResponseDto,
  UpdateBookingNotesDto,
} from './dto/booking.dto'

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name)

  constructor(
    @Inject(BookingRepo)
    private readonly bookingRepo: BookingRepository,
    private readonly scheduleService: ClassScheduleService,
    private readonly wsService: UserPresenceWebsocketService
  ) {}

  /**
   * Book a class for a participant
   * Handles capacity limits and waitlist logic
   */
  @Transactional()
  async createBooking(participantId: number, scheduleId: number): Promise<BookingResponseDto> {
    // Verify schedule exists and is not cancelled
    const schedule = await this.scheduleService.findByIdWithClass(scheduleId)
    if (!schedule) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'SCHEDULE_NOT_FOUND')
    }
    if (schedule.isCancelled) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'SCHEDULE_IS_CANCELLED')
    }

    // Check if already booked
    const existing = await this.bookingRepo.findByScheduleAndParticipant(scheduleId, participantId)
    if (existing) {
      this.logger.log(
        `Found existing booking ${existing.id} for participant ${participantId} on schedule ${scheduleId} with status: ${existing.status} (${typeof existing.status}), cancelledAt: ${existing.cancelledAt}`
      )

      // Allow rebooking if booking is in a "completed" state:
      // - CANCELLED: User cancelled or organizer cancelled
      // - NO_SHOW: User didn't attend (organizer marked as no-show)
      // - ATTENDED: User already attended (can book again for another session)
      const canRebook =
        existing.status === BookingStatus.CANCELLED ||
        existing.status === BookingStatus.NO_SHOW ||
        existing.status === BookingStatus.ATTENDED ||
        existing.cancelledAt !== null ||
        String(existing.status) === 'CANCELLED' ||
        String(existing.status) === 'NO_SHOW' ||
        String(existing.status) === 'ATTENDED'

      if (canRebook) {
        this.logger.log(
          `Booking ${existing.id} is in rebookable state (status: ${existing.status}, cancelledAt: ${existing.cancelledAt}), allowing rebook for participant ${participantId} on schedule ${scheduleId}`
        )
        return this.rebookCancelledBooking(existing.id, schedule)
      }

      // If booking exists with any other status, user is already booked/waitlisted
      this.logger.warn(
        `Participant ${participantId} already has booking ${existing.id} on schedule ${scheduleId} with status ${existing.status} (expected CANCELLED for rebooking). Cannot rebook.`
      )
      throw new ApiException(HttpStatus.CONFLICT, 'ALREADY_BOOKED')
    }

    // Get current booking counts
    const bookedCount = await this.bookingRepo.countByScheduleId(scheduleId, [BookingStatus.BOOKED])
    const waitlistedCount = await this.bookingRepo.countByScheduleId(scheduleId, [BookingStatus.WAITLISTED])

    const capacity = schedule.class.capacity
    const waitlistLimit = schedule.class.waitlistLimit
    const isCapacitySoft = schedule.class.isCapacitySoft

    // Determine booking status
    let status: BookingStatus
    let waitlistPosition: number | null = null

    if (capacity === null || bookedCount < capacity || isCapacitySoft) {
      // Has space (or soft capacity) - book directly
      status = BookingStatus.BOOKED
    } else if (waitlistLimit === null || waitlistedCount < waitlistLimit) {
      // No space but waitlist available
      status = BookingStatus.WAITLISTED
      waitlistPosition = (await this.bookingRepo.getMaxWaitlistPosition(scheduleId)) + 1
    } else {
      throw new ApiException(HttpStatus.CONFLICT, 'CLASS_FULL_AND_WAITLIST_FULL')
    }

    const booking = await this.bookingRepo.create({
      classSchedule: { connect: { id: scheduleId } },
      participant: { connect: { id: participantId } },
      status,
      waitlistPosition,
    })

    this.logger.log(
      `Created booking ${booking.id} for participant ${participantId} on schedule ${scheduleId} with status ${status}`
    )

    // Notify organizer about new booking via WebSocket
    this.notifyOrganizerOfBookingUpdate(schedule.class.organizerId, scheduleId, 'created')

    return this.toBasicResponseDto(booking)
  }

  /**
   * Rebook a previously cancelled/completed booking
   * Handles CANCELLED, NO_SHOW, and ATTENDED statuses
   */
  @Transactional()
  private async rebookCancelledBooking(
    bookingId: number,
    schedule: ClassScheduleWithClass
  ): Promise<BookingResponseDto> {
    // Verify the booking exists and is in a rebookable state
    const existingBooking = await this.bookingRepo.findById(bookingId)
    if (!existingBooking) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'BOOKING_NOT_FOUND')
    }

    const isRebookable =
      existingBooking.status === BookingStatus.CANCELLED ||
      existingBooking.status === BookingStatus.NO_SHOW ||
      existingBooking.status === BookingStatus.ATTENDED ||
      existingBooking.cancelledAt !== null ||
      String(existingBooking.status) === 'CANCELLED' ||
      String(existingBooking.status) === 'NO_SHOW' ||
      String(existingBooking.status) === 'ATTENDED'

    if (!isRebookable) {
      this.logger.error(
        `Attempted to rebook booking ${bookingId} but status is ${existingBooking.status}, which is not rebookable`
      )
      throw new ApiException(HttpStatus.BAD_REQUEST, 'BOOKING_NOT_REBOOKABLE')
    }

    const scheduleId = schedule.id
    const bookedCount = await this.bookingRepo.countByScheduleId(scheduleId, [BookingStatus.BOOKED])
    const waitlistedCount = await this.bookingRepo.countByScheduleId(scheduleId, [BookingStatus.WAITLISTED])

    const capacity = schedule.class.capacity
    const waitlistLimit = schedule.class.waitlistLimit
    const isCapacitySoft = schedule.class.isCapacitySoft

    let status: BookingStatus
    let waitlistPosition: number | null = null

    if (capacity === null || bookedCount < capacity || isCapacitySoft) {
      // Has space (or soft capacity) - book directly
      status = BookingStatus.BOOKED
    } else if (waitlistLimit === null || waitlistedCount < waitlistLimit) {
      // No space but waitlist available
      status = BookingStatus.WAITLISTED
      waitlistPosition = (await this.bookingRepo.getMaxWaitlistPosition(scheduleId)) + 1
    } else {
      throw new ApiException(HttpStatus.CONFLICT, 'CLASS_FULL_AND_WAITLIST_FULL')
    }

    const updated = await this.bookingRepo.update(bookingId, {
      status,
      waitlistPosition,
      bookedAt: new Date(),
      cancelledAt: null,
      cancelReason: null,
      cancelledByOrganizer: false,
    })

    this.logger.log(
      `Rebooked cancelled booking ${bookingId} for schedule ${scheduleId} with status ${status}${waitlistPosition ? ` (waitlist position ${waitlistPosition})` : ''}`
    )

    // Notify organizer about rebooking via WebSocket
    this.notifyOrganizerOfBookingUpdate(schedule.class.organizerId, scheduleId, 'created')

    return this.toBasicResponseDto(updated)
  }

  /**
   * Cancel a booking (by participant)
   */
  @Transactional()
  async cancelBooking(bookingId: number, participantId: number, dto?: CancelBookingDto): Promise<void> {
    const booking = await this.bookingRepo.findByIdWithAll(bookingId)

    if (!booking) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'BOOKING_NOT_FOUND')
    }

    // Verify ownership
    if (booking.participantId !== participantId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'BOOKING_ACCESS_DENIED')
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'BOOKING_ALREADY_CANCELLED')
    }

    const wasBooked = booking.status === BookingStatus.BOOKED
    const waitlistPosition = booking.waitlistPosition

    const updated = await this.bookingRepo.update(bookingId, {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: dto?.cancelReason ?? null,
      cancelledByOrganizer: false,
      waitlistPosition: null,
    })

    this.logger.log(
      `Cancelled booking ${bookingId} by participant. New status: ${updated.status} (${typeof updated.status})`
    )

    // Notify organizer about cancellation via WebSocket
    this.notifyOrganizerOfBookingUpdate(booking.classSchedule.class.organizerId, booking.classScheduleId, 'cancelled')

    // If was booked (not waitlisted), promote next waitlisted person
    if (wasBooked) {
      await this.promoteFromWaitlist(booking.classScheduleId)
    } else if (waitlistPosition !== null) {
      // Decrement positions for those behind in waitlist
      await this.bookingRepo.decrementWaitlistPositions(booking.classScheduleId, waitlistPosition)
    }
  }

  /**
   * Cancel a booking (by organizer)
   */
  @Transactional()
  async cancelBookingByOrganizer(bookingId: number, organizerId: number, dto?: CancelBookingDto): Promise<void> {
    const booking = await this.bookingRepo.findByIdWithAll(bookingId)

    if (!booking) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'BOOKING_NOT_FOUND')
    }

    // Verify organizer ownership
    if (booking.classSchedule.class.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'BOOKING_ACCESS_DENIED')
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'BOOKING_ALREADY_CANCELLED')
    }

    const wasBooked = booking.status === BookingStatus.BOOKED
    const waitlistPosition = booking.waitlistPosition

    await this.bookingRepo.update(bookingId, {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: dto?.cancelReason ?? null,
      cancelledByOrganizer: true,
      waitlistPosition: null,
    })

    this.logger.log(`Cancelled booking ${bookingId} by organizer`)

    // Notify organizer about their own cancellation action (for multi-device sync)
    this.notifyOrganizerOfBookingUpdate(booking.classSchedule.class.organizerId, booking.classScheduleId, 'cancelled')

    // TODO: Notify participant about cancellation

    // Promote from waitlist if space opened up
    if (wasBooked) {
      await this.promoteFromWaitlist(booking.classScheduleId)
    } else if (waitlistPosition !== null) {
      await this.bookingRepo.decrementWaitlistPositions(booking.classScheduleId, waitlistPosition)
    }
  }

  /**
   * Promote the first waitlisted person to booked
   */
  @Transactional()
  private async promoteFromWaitlist(scheduleId: number): Promise<void> {
    const nextInLine = await this.bookingRepo.getNextWaitlistedBooking(scheduleId)

    if (nextInLine) {
      const oldPosition = nextInLine.waitlistPosition

      await this.bookingRepo.update(nextInLine.id, {
        status: BookingStatus.BOOKED,
        waitlistPosition: null,
      })

      // Decrement positions for remaining waitlisted
      if (oldPosition !== null) {
        await this.bookingRepo.decrementWaitlistPositions(scheduleId, oldPosition)
      }

      this.logger.log(`Promoted booking ${nextInLine.id} from waitlist`)

      // TODO: Notify participant about promotion
    }
  }

  /**
   * Get bookings for a schedule (organizer view)
   */
  async getBookingsForSchedule(scheduleId: number, organizerId: number): Promise<BookingListResponseDto> {
    const schedule = await this.scheduleService.findByIdWithClass(scheduleId)

    if (!schedule) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'SCHEDULE_NOT_FOUND')
    }

    // Verify organizer ownership
    if (schedule.class.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'SCHEDULE_ACCESS_DENIED')
    }

    // Get all bookings for the schedule (including cancelled, attended, no-show for historical record)
    const allBookings = await this.bookingRepo.findByScheduleId(scheduleId)

    // Filter out cancelled/completed bookings from the main list (they're in a completed state)
    // But keep them in the total count for historical purposes
    const activeBookings = allBookings.filter(
      (b) =>
        b.status !== BookingStatus.CANCELLED &&
        b.status !== BookingStatus.ATTENDED &&
        b.status !== BookingStatus.NO_SHOW
    )

    const booked = allBookings.filter((b) => b.status === BookingStatus.BOOKED).length
    const waitlisted = allBookings.filter((b) => b.status === BookingStatus.WAITLISTED).length

    return {
      bookings: activeBookings.map(this.toParticipantResponseDto),
      total: allBookings.length,
      booked,
      waitlisted,
    }
  }

  /**
   * Get participant's bookings (my bookings view)
   */
  async getMyBookings(participantId: number): Promise<MyBookingsResponseDto> {
    const upcoming = await this.bookingRepo.findByParticipantId(participantId, {
      upcoming: true,
      statuses: [BookingStatus.BOOKED, BookingStatus.WAITLISTED],
    })

    const past = await this.bookingRepo.findByParticipantId(participantId, {
      past: true,
      statuses: [
        BookingStatus.BOOKED,
        BookingStatus.WAITLISTED,
        BookingStatus.ATTENDED,
        BookingStatus.NO_SHOW,
        BookingStatus.CANCELLED,
      ],
    })

    // Get recently cancelled bookings (upcoming schedules that were cancelled)
    const cancelled = await this.bookingRepo.findByParticipantId(participantId, {
      upcoming: true,
      statuses: [BookingStatus.CANCELLED],
    })

    return {
      upcoming: upcoming.map(this.toScheduleResponseDto),
      past: past.slice(0, 20).map(this.toScheduleResponseDto), // Limit past bookings
      cancelled: cancelled.map(this.toScheduleResponseDto),
    }
  }

  /**
   * Mark attendance for bookings
   */
  @Transactional()
  async markAttendance(organizerId: number, dto: MarkAttendanceDto): Promise<number> {
    // Verify all bookings belong to this organizer
    for (const bookingId of dto.bookingIds) {
      const booking = await this.bookingRepo.findByIdWithAll(bookingId)

      if (!booking) {
        throw new ApiException(HttpStatus.NOT_FOUND, `BOOKING_NOT_FOUND: ${bookingId}`)
      }

      if (booking.classSchedule.class.organizerId !== organizerId) {
        throw new ApiException(HttpStatus.FORBIDDEN, `BOOKING_ACCESS_DENIED: ${bookingId}`)
      }

      // Only allow marking attendance for active bookings (BOOKED or WAITLISTED)
      // Prevent marking cancelled, already attended, or no-show bookings
      if (booking.status !== BookingStatus.BOOKED && booking.status !== BookingStatus.WAITLISTED) {
        this.logger.warn(
          `Attempted to mark attendance for booking ${bookingId} with status ${booking.status}. Only BOOKED or WAITLISTED bookings can be marked.`
        )
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          `BOOKING_NOT_IN_BOOKED_STATUS: ${bookingId} (current status: ${booking.status})`
        )
      }
    }

    const status = dto.status === 'ATTENDED' ? BookingStatus.ATTENDED : BookingStatus.NO_SHOW

    const updated = await this.bookingRepo.updateMany(dto.bookingIds, {
      status,
      attendedAt: dto.status === 'ATTENDED' ? new Date() : null,
    })

    this.logger.log(`Marked ${updated} bookings as ${dto.status}`)
    return updated
  }

  /**
   * Update organizer notes on a booking
   */
  @Transactional()
  async updateBookingNotes(
    bookingId: number,
    organizerId: number,
    dto: UpdateBookingNotesDto
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findByIdWithAll(bookingId)

    if (!booking) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'BOOKING_NOT_FOUND')
    }

    // Verify organizer ownership
    if (booking.classSchedule.class.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'BOOKING_ACCESS_DENIED')
    }

    const updated = await this.bookingRepo.update(bookingId, {
      organizerNotes: dto.organizerNotes,
    })

    return this.toBasicResponseDto(updated)
  }

  private toBasicResponseDto(booking: {
    id: number
    classScheduleId: number
    participantId: number
    status: BookingStatus
    bookedAt: Date
    cancelledAt: Date | null
    attendedAt: Date | null
    waitlistPosition: number | null
    cancelledByOrganizer: boolean
    cancelReason: string | null
    organizerNotes: string | null
    createdAt: Date
  }): BookingResponseDto {
    return {
      id: booking.id,
      classScheduleId: booking.classScheduleId,
      participantId: booking.participantId,
      status: booking.status,
      bookedAt: booking.bookedAt,
      cancelledAt: booking.cancelledAt,
      attendedAt: booking.attendedAt,
      waitlistPosition: booking.waitlistPosition,
      cancelledByOrganizer: booking.cancelledByOrganizer,
      cancelReason: booking.cancelReason,
      organizerNotes: booking.organizerNotes,
      createdAt: booking.createdAt,
    }
  }

  async findByScheduleIds(scheduleIds: number[], statuses?: BookingStatus[]) {
    return this.bookingRepo.findByScheduleIds(scheduleIds, statuses)
  }

  async findByScheduleId(scheduleId: number, statuses?: BookingStatus[]) {
    return this.bookingRepo.findByScheduleId(scheduleId, statuses)
  }

  async cancelAllByScheduleId(scheduleId: number, cancelReason?: string) {
    return this.bookingRepo.cancelAllByScheduleId(scheduleId, cancelReason)
  }

  async cancelAllByScheduleIds(scheduleIds: number[], cancelReason?: string) {
    return this.bookingRepo.cancelAllByScheduleIds(scheduleIds, cancelReason)
  }

  async findByParticipantAndScheduleIds(participantId: number, scheduleIds: number[], statuses?: BookingStatus[]) {
    return this.bookingRepo.findByParticipantAndScheduleIds(participantId, scheduleIds, statuses)
  }

  private toParticipantResponseDto(booking: BookingWithParticipant): BookingResponseDto {
    return {
      id: booking.id,
      classScheduleId: booking.classScheduleId,
      participantId: booking.participantId,
      status: booking.status,
      bookedAt: booking.bookedAt,
      cancelledAt: booking.cancelledAt,
      attendedAt: booking.attendedAt,
      waitlistPosition: booking.waitlistPosition,
      cancelledByOrganizer: booking.cancelledByOrganizer,
      cancelReason: booking.cancelReason,
      organizerNotes: booking.organizerNotes,
      createdAt: booking.createdAt,
      participant: {
        id: booking.participant.id,
        appUser: {
          id: booking.participant.appUser.id,
          authUser: {
            username: booking.participant.appUser.authUser.username,
            firstName: booking.participant.appUser.authUser.userProfiles[0]?.firstName || null,
            lastName: booking.participant.appUser.authUser.userProfiles[0]?.lastName || null,
          },
        },
      },
      classSchedule: booking.classSchedule
        ? {
            id: booking.classSchedule.id,
            startTimeUtc: booking.classSchedule.startTimeUtc,
            endTimeUtc: booking.classSchedule.endTimeUtc,
            localTimezone: booking.classSchedule.localTimezone,
            class: {
              id: booking.classSchedule.class.id,
              title: booking.classSchedule.class.title,
            },
          }
        : undefined,
    }
  }

  private toScheduleResponseDto(booking: BookingWithSchedule): BookingResponseDto {
    return {
      id: booking.id,
      classScheduleId: booking.classScheduleId,
      participantId: booking.participantId,
      status: booking.status,
      bookedAt: booking.bookedAt,
      cancelledAt: booking.cancelledAt,
      attendedAt: booking.attendedAt,
      waitlistPosition: booking.waitlistPosition,
      cancelledByOrganizer: booking.cancelledByOrganizer,
      cancelReason: booking.cancelReason,
      organizerNotes: booking.organizerNotes,
      createdAt: booking.createdAt,
      classSchedule: {
        id: booking.classSchedule.id,
        startTimeUtc: booking.classSchedule.startTimeUtc,
        endTimeUtc: booking.classSchedule.endTimeUtc,
        localTimezone: booking.classSchedule.localTimezone,
        class: {
          id: booking.classSchedule.class.id,
          title: booking.classSchedule.class.title,
        },
      },
    }
  }

  /**
   * Notify organizer about booking updates via WebSocket
   */
  private notifyOrganizerOfBookingUpdate(
    organizerId: number,
    scheduleId: number,
    action: 'created' | 'cancelled'
  ): void {
    try {
      this.wsService.sendToRoom(Rooms.organizer(organizerId), Events.bookingUpdate, {
        scheduleId,
        action,
        timestamp: new Date().toISOString(),
      })
      this.logger.debug(`Notified organizer ${organizerId} of booking ${action} for schedule ${scheduleId}`)
    } catch (error) {
      this.logger.warn(`Failed to notify organizer ${organizerId} of booking update: ${error}`)
    }
  }
}
