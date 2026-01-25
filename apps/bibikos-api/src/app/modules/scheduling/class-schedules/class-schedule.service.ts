import { BookingStatus } from '@js-monorepo/bibikos-db'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { Events, Rooms, UserPresenceWebsocketService } from '@js-monorepo/user-presence'
import { Transactional } from '@nestjs-cls/transactional'
import { forwardRef, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { BookingService } from '../bookings'
import { ClassService } from '../classes'
import { OrganizerService } from '../organizers'
import { ClassScheduleRepo, ClassScheduleRepository } from './class-schedule.repository'
import {
  CancelClassScheduleDto,
  ClassScheduleResponseDto,
  CreateClassScheduleDto,
  UpdateClassScheduleDto,
} from './dto/class-schedule.dto'
import { CursorPaginationType } from '@js-monorepo/types/pagination'

// Simple RRULE parser for basic recurrence patterns
// Supports: FREQ=WEEKLY;BYDAY=MO,WE,FR, FREQ=WEEKLY;INTERVAL=2;BYDAY=TU
interface RRuleComponents {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  interval: number
  byDay?: string[]
  count?: number
  until?: Date
}

@Injectable()
export class ClassScheduleService {
  private readonly logger = new Logger(ClassScheduleService.name)

  // Default: generate occurrences for 12 weeks ahead
  private readonly DEFAULT_OCCURRENCE_WEEKS = 12

  constructor(
    @Inject(ClassScheduleRepo)
    private readonly scheduleRepo: ClassScheduleRepository,
    private readonly classService: ClassService,
    private readonly organizerService: OrganizerService,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    private readonly wsService: UserPresenceWebsocketService
  ) {}

  /**
   * Get schedules for calendar view (date range query)
   * For bookings view, include cancelled schedules that have bookings
   */
  async getSchedulesForCalendar(
    organizerId: number,
    startDate: string,
    endDate: string,
    classId?: number,
    includeCancelledWithBookings = false
  ): Promise<ClassScheduleResponseDto[]> {
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate date range (max 3 months)
    const maxRange = 92 * 24 * 60 * 60 * 1000 // 92 days
    if (end.getTime() - start.getTime() > maxRange) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'DATE_RANGE_TOO_LARGE')
    }

    const schedules = await this.scheduleRepo.findByOrganizerIdInRange(
      organizerId,
      start,
      end,
      classId,
      includeCancelledWithBookings
    )
    return schedules.map(this.toResponseDto)
  }

  /**
   * Get upcoming schedules for a specific class
   */
  async getUpcomingSchedules(classId: number, organizerId: number, limit = 10): Promise<ClassScheduleResponseDto[]> {
    // Verify class ownership
    const classEntity = await this.classService.findById(classId)
    if (!classEntity) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND')
    }
    if (classEntity.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'CLASS_ACCESS_DENIED')
    }

    const schedules = await this.scheduleRepo.findUpcomingByClassId(classId, limit)
    return schedules.map((s) => ({
      id: s.id,
      classId: s.classId,
      startTimeUtc: s.startTimeUtc,
      endTimeUtc: s.endTimeUtc,
      localTimezone: s.localTimezone,
      recurrenceRule: s.recurrenceRule,
      occurrenceDate: s.occurrenceDate,
      parentScheduleId: s.parentScheduleId,
      isCancelled: s.isCancelled,
      cancelledAt: s.cancelledAt,
      cancelReason: s.cancelReason,
      createdAt: s.createdAt,
    }))
  }

  /**
   * Get a single schedule by ID
   */
  async getSchedule(scheduleId: number, organizerId: number): Promise<ClassScheduleResponseDto> {
    const schedule = await this.scheduleRepo.findByIdWithClass(scheduleId)

    if (!schedule) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'SCHEDULE_NOT_FOUND')
    }

    // Verify ownership
    if (schedule.class.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'SCHEDULE_ACCESS_DENIED')
    }

    return this.toResponseDto(schedule)
  }

  /**
   * Get schedule for public view (booking page)
   */
  async getSchedulePublic(scheduleId: number): Promise<ClassScheduleResponseDto | null> {
    const schedule = await this.scheduleRepo.findByIdWithClass(scheduleId)

    if (!schedule || schedule.isCancelled) {
      return null
    }

    return this.toResponseDto(schedule)
  }

  async findByIdWithClass(scheduleId: number) {
    return this.scheduleRepo.findByIdWithClass(scheduleId)
  }

  /**
   * Get public schedules by organizer slug (for /coach/:slug page)
   */
  async getPublicSchedulesBySlug(
    slug: string,
    startDate: string,
    endDate: string
  ): Promise<ClassScheduleResponseDto[]> {
    const organizer = await this.organizerService.findBySlug(slug)
    if (!organizer) {
      return []
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate date range (max 3 months)
    const maxRange = 92 * 24 * 60 * 60 * 1000
    if (end.getTime() - start.getTime() > maxRange) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'DATE_RANGE_TOO_LARGE')
    }

    const schedules = await this.scheduleRepo.findPublicByOrganizerIdInRange(organizer.id, start, end)
    return schedules.map(this.toResponseDto)
  }

  /**
   * Discover schedules with cursor-based pagination for virtual scrolling
   * Returns a continuous stream of schedules starting from now
   */
  async discoverSchedulesByCursor(
    filters: {
      timeOfDay?: 'morning' | 'afternoon' | 'evening'
      search?: string
      tagIds?: number[]
    },
    cursor: number | null,
    limit: number,
    participantId?: number,
    appUserId?: number
  ): Promise<
    CursorPaginationType<
      ClassScheduleResponseDto & {
        organizer: { id: number; displayName: string | null; slug: string | null }
        tags: Array<{ id: number; name: string }>
        myBooking: { id: number; status: string; waitlistPosition: number | null } | null
      }
    >
  > {
    // Clamp limit to max 50
    const clampedLimit = Math.min(Math.max(limit, 1), 50)

    const result = await this.scheduleRepo.findForDiscoverByCursor(
      {
        timeOfDay: filters.timeOfDay,
        search: filters.search,
        tagIds: filters.tagIds,
      },
      cursor,
      clampedLimit,
      appUserId
    )

    // If user is logged in, fetch their bookings for these schedules
    const userBookingsMap: Map<number, { id: number; status: string; waitlistPosition: number | null }> = new Map()
    if (participantId && result.schedules.length > 0) {
      const scheduleIds = result.schedules.map((s) => s.id)
      const userBookings = await this.bookingService.findByParticipantAndScheduleIds(participantId, scheduleIds, [
        BookingStatus.BOOKED,
        BookingStatus.WAITLISTED,
      ])
      for (const booking of userBookings) {
        userBookingsMap.set(booking.classScheduleId, {
          id: booking.id,
          status: booking.status,
          waitlistPosition: booking.waitlistPosition,
        })
      }
    }

    // Determine next cursor (last item's id)
    const nextCursor =
      result.hasMore && result.schedules.length > 0 ? result.schedules[result.schedules.length - 1].id : null

    const content = result.schedules.map((schedule) => ({
      ...this.toResponseDto(schedule),
      organizer: schedule.organizer,
      tags: schedule.tags,
      myBooking: userBookingsMap.get(schedule.id) || null,
    }))

    return {
      content,
      nextCursor,
      hasMore: result.hasMore,
      limit: clampedLimit,
    }
  }

  async findUpcomingByClassIdWithBookingCounts(classId: number, limit?: number) {
    return this.scheduleRepo.findUpcomingByClassIdWithBookingCounts(classId, limit)
  }

  /**
   * Create a new class schedule
   * If recurrenceRule is provided, generates multiple occurrences
   */
  @Transactional()
  async createSchedule(organizerId: number, dto: CreateClassScheduleDto): Promise<ClassScheduleResponseDto[]> {
    // Verify class ownership
    const classEntity = await this.classService.findByIdWithLocation(dto.classId)
    if (!classEntity) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND')
    }
    if (classEntity.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'CLASS_ACCESS_DENIED')
    }

    const startTime = new Date(dto.startTimeUtc)
    const endTime = new Date(dto.endTimeUtc)

    // Validate time range
    if (endTime <= startTime) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'END_TIME_MUST_BE_AFTER_START')
    }

    const localTimezone = classEntity.location.timezone
    const createdSchedules: ClassScheduleResponseDto[] = []

    if (dto.recurrenceRule) {
      // Create recurring schedule
      const parentSchedule = await this.scheduleRepo.create({
        class: { connect: { id: dto.classId } },
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        localTimezone,
        recurrenceRule: dto.recurrenceRule,
        occurrenceDate: this.formatOccurrenceDate(startTime),
      })

      createdSchedules.push({
        id: parentSchedule.id,
        classId: parentSchedule.classId,
        startTimeUtc: parentSchedule.startTimeUtc,
        endTimeUtc: parentSchedule.endTimeUtc,
        localTimezone: parentSchedule.localTimezone,
        recurrenceRule: parentSchedule.recurrenceRule,
        occurrenceDate: parentSchedule.occurrenceDate,
        parentScheduleId: null,
        isCancelled: false,
        cancelledAt: null,
        cancelReason: null,
        createdAt: parentSchedule.createdAt,
      })

      // Generate future occurrences
      const occurrences = this.generateOccurrences(startTime, endTime, dto.recurrenceRule, localTimezone)

      if (occurrences.length > 0) {
        const occurrenceData = occurrences.map((occ) => ({
          classId: dto.classId,
          startTimeUtc: occ.start,
          endTimeUtc: occ.end,
          localTimezone,
          recurrenceRule: null,
          occurrenceDate: this.formatOccurrenceDate(occ.start),
          parentScheduleId: parentSchedule.id,
        }))

        await this.scheduleRepo.createMany(occurrenceData)
        this.logger.log(`Created ${occurrences.length} recurring occurrences for schedule ${parentSchedule.id}`)
      }
    } else {
      // Create one-time schedule
      const schedule = await this.scheduleRepo.create({
        class: { connect: { id: dto.classId } },
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        localTimezone,
        recurrenceRule: null,
        occurrenceDate: null,
      })

      createdSchedules.push({
        id: schedule.id,
        classId: schedule.classId,
        startTimeUtc: schedule.startTimeUtc,
        endTimeUtc: schedule.endTimeUtc,
        localTimezone: schedule.localTimezone,
        recurrenceRule: null,
        occurrenceDate: null,
        parentScheduleId: null,
        isCancelled: false,
        cancelledAt: null,
        cancelReason: null,
        createdAt: schedule.createdAt,
      })
    }

    this.logger.log(`Created schedule(s) for class ${dto.classId}`)
    return createdSchedules
  }

  /**
   * Update a schedule (single occurrence)
   */
  @Transactional()
  async updateSchedule(
    scheduleId: number,
    organizerId: number,
    dto: UpdateClassScheduleDto
  ): Promise<ClassScheduleResponseDto> {
    const schedule = await this.scheduleRepo.findByIdWithClass(scheduleId)

    if (!schedule) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'SCHEDULE_NOT_FOUND')
    }

    // Verify ownership
    if (schedule.class.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'SCHEDULE_ACCESS_DENIED')
    }

    const updates: Record<string, unknown> = {}

    if (dto.startTimeUtc !== undefined) {
      updates.startTimeUtc = new Date(dto.startTimeUtc)
    }
    if (dto.endTimeUtc !== undefined) {
      updates.endTimeUtc = new Date(dto.endTimeUtc)
    }

    // Validate time range if both provided
    const newStart = (updates.startTimeUtc as Date) || schedule.startTimeUtc
    const newEnd = (updates.endTimeUtc as Date) || schedule.endTimeUtc
    if (newEnd <= newStart) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'END_TIME_MUST_BE_AFTER_START')
    }

    const updated = await this.scheduleRepo.update(scheduleId, updates)
    this.logger.log(`Updated schedule ${scheduleId}`)

    return {
      id: updated.id,
      classId: updated.classId,
      startTimeUtc: updated.startTimeUtc,
      endTimeUtc: updated.endTimeUtc,
      localTimezone: updated.localTimezone,
      recurrenceRule: updated.recurrenceRule,
      occurrenceDate: updated.occurrenceDate,
      parentScheduleId: updated.parentScheduleId,
      isCancelled: updated.isCancelled,
      cancelledAt: updated.cancelledAt,
      cancelReason: updated.cancelReason,
      createdAt: updated.createdAt,
    }
  }

  /**
   * Cancel a schedule
   * Also cancels all active bookings for this schedule
   */
  @Transactional()
  async cancelSchedule(scheduleId: number, organizerId: number, dto?: CancelClassScheduleDto): Promise<void> {
    const schedule = await this.scheduleRepo.findByIdWithClass(scheduleId)

    if (!schedule) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'SCHEDULE_NOT_FOUND')
    }

    // Verify ownership
    if (schedule.class.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'SCHEDULE_ACCESS_DENIED')
    }

    if (schedule.isCancelled) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'SCHEDULE_ALREADY_CANCELLED')
    }

    // Get participants to notify before cancelling bookings
    const activeBookings = await this.bookingService.findByScheduleId(scheduleId, [
      BookingStatus.BOOKED,
      BookingStatus.WAITLISTED,
    ])
    const participantIds = activeBookings.map((b) => b.participantId)

    // Cancel the schedule
    await this.scheduleRepo.update(scheduleId, {
      isCancelled: true,
      cancelledAt: new Date(),
      cancelReason: dto?.cancelReason ?? null,
    })

    // Cancel all active bookings for this schedule
    const cancelledBookings = await this.bookingService.cancelAllByScheduleId(
      scheduleId,
      dto?.cancelReason ?? 'Class schedule cancelled by organizer'
    )

    this.logger.log(`Cancelled schedule ${scheduleId} and ${cancelledBookings} booking(s)`)

    // Notify participants about cancellation via WebSocket
    this.notifyParticipantsOfScheduleCancellation(participantIds, scheduleId, schedule.class.title)
  }

  /**
   * Notify participants about schedule cancellation via WebSocket
   */
  private notifyParticipantsOfScheduleCancellation(
    participantIds: number[],
    scheduleId: number,
    classTitle: string
  ): void {
    const payload = {
      scheduleId,
      classTitle,
      timestamp: new Date().toISOString(),
    }

    for (const participantId of participantIds) {
      try {
        this.wsService.sendToRoom(Rooms.participant(participantId), Events.scheduleCancelled, payload)
        this.logger.debug(`Notified participant ${participantId} of schedule cancellation`)
      } catch (error) {
        this.logger.warn(`Failed to notify participant ${participantId} of schedule cancellation: ${error}`)
      }
    }
  }

  /**
   * Delete future occurrences of a recurring schedule
   */
  @Transactional()
  async deleteFutureOccurrences(parentScheduleId: number, organizerId: number): Promise<number> {
    const schedule = await this.scheduleRepo.findByIdWithClass(parentScheduleId)

    if (!schedule) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'SCHEDULE_NOT_FOUND')
    }

    // Verify ownership
    if (schedule.class.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'SCHEDULE_ACCESS_DENIED')
    }

    // Only delete future occurrences
    const deleted = await this.scheduleRepo.deleteByParentScheduleId(parentScheduleId, new Date())
    this.logger.log(`Deleted ${deleted} future occurrences for parent schedule ${parentScheduleId}`)

    return deleted
  }

  /**
   * Cancel this schedule and all future schedules in the recurring series
   * Works from any schedule in the series (parent or child)
   * Notifies all affected participants
   */
  @Transactional()
  async cancelFutureSchedules(
    scheduleId: number,
    organizerId: number,
    dto?: CancelClassScheduleDto
  ): Promise<{ cancelled: number }> {
    const schedule = await this.scheduleRepo.findByIdWithClass(scheduleId)

    if (!schedule) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'SCHEDULE_NOT_FOUND')
    }

    // Verify ownership
    if (schedule.class.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'SCHEDULE_ACCESS_DENIED')
    }

    // Check if this is part of a recurring series
    const isRecurring = schedule.parentScheduleId !== null || schedule.recurrenceRule !== null

    if (!isRecurring) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'SCHEDULE_NOT_RECURRING')
    }

    // Find all future schedules in the series (including this one)
    const futureSchedules = await this.scheduleRepo.findFutureInSeries(scheduleId, schedule.startTimeUtc)

    if (futureSchedules.length === 0) {
      return { cancelled: 0 }
    }

    const scheduleIds = futureSchedules.map((s) => s.id)
    const cancelReason = dto?.cancelReason ?? 'Series cancelled by organizer'

    // Get all participants across all schedules to notify
    const activeBookings = await this.bookingService.findByScheduleIds(scheduleIds, [
      BookingStatus.BOOKED,
      BookingStatus.WAITLISTED,
    ])

    // Group participants by schedule for targeted notifications
    const participantsBySchedule = new Map<number, number[]>()
    for (const booking of activeBookings) {
      const participants = participantsBySchedule.get(booking.classScheduleId) || []
      participants.push(booking.participantId)
      participantsBySchedule.set(booking.classScheduleId, participants)
    }

    // Cancel all schedules
    const cancelledCount = await this.scheduleRepo.cancelMany(scheduleIds, cancelReason)

    // Cancel all bookings for these schedules
    await this.bookingService.cancelAllByScheduleIds(scheduleIds, cancelReason)

    this.logger.log(`Cancelled ${cancelledCount} schedules in series and their bookings`)

    // Notify all participants
    const allParticipantIds = [...new Set(activeBookings.map((b) => b.participantId))]
    this.notifyParticipantsOfScheduleCancellation(allParticipantIds, scheduleId, schedule.class.title)

    return { cancelled: cancelledCount }
  }

  /**
   * Generate occurrences based on RRULE
   */
  private generateOccurrences(
    startTime: Date,
    endTime: Date,
    rrule: string,
    _timezone: string
  ): Array<{ start: Date; end: Date }> {
    const components = this.parseRRule(rrule)
    if (!components) return []

    const occurrences: Array<{ start: Date; end: Date }> = []
    const duration = endTime.getTime() - startTime.getTime()
    // COUNT includes the parent schedule, so we generate COUNT - 1 children
    const maxOccurrences = components.count ? components.count - 1 : this.DEFAULT_OCCURRENCE_WEEKS * 7
    const endDate = components.until || new Date(Date.now() + this.DEFAULT_OCCURRENCE_WEEKS * 7 * 24 * 60 * 60 * 1000)

    let currentDate = new Date(startTime)

    // Skip the first occurrence (already created as parent)
    currentDate = this.getNextOccurrence(currentDate, components)

    while (occurrences.length < maxOccurrences && currentDate <= endDate) {
      occurrences.push({
        start: new Date(currentDate),
        end: new Date(currentDate.getTime() + duration),
      })
      currentDate = this.getNextOccurrence(currentDate, components)
    }

    return occurrences
  }

  private getNextOccurrence(current: Date, components: RRuleComponents): Date {
    const next = new Date(current)

    switch (components.freq) {
      case 'DAILY':
        next.setDate(next.getDate() + components.interval)
        break
      case 'WEEKLY':
        if (components.byDay && components.byDay.length > 0) {
          // Find next matching day
          do {
            next.setDate(next.getDate() + 1)
          } while (!this.matchesByDay(next, components.byDay))
        } else {
          next.setDate(next.getDate() + 7 * components.interval)
        }
        break
      case 'MONTHLY':
        next.setMonth(next.getMonth() + components.interval)
        break
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + components.interval)
        break
    }

    return next
  }

  private matchesByDay(date: Date, byDay: string[]): boolean {
    const dayMap: Record<string, number> = {
      SU: 0,
      MO: 1,
      TU: 2,
      WE: 3,
      TH: 4,
      FR: 5,
      SA: 6,
    }
    const dayOfWeek = date.getDay()
    return byDay.some((day) => dayMap[day] === dayOfWeek)
  }

  private parseRRule(rrule: string): RRuleComponents | null {
    try {
      const parts = rrule.split(';')
      const components: Partial<RRuleComponents> = {
        interval: 1,
      }

      for (const part of parts) {
        const [key, value] = part.split('=')
        switch (key) {
          case 'FREQ':
            components.freq = value as RRuleComponents['freq']
            break
          case 'INTERVAL':
            components.interval = parseInt(value, 10)
            break
          case 'BYDAY':
            components.byDay = value.split(',')
            break
          case 'COUNT':
            components.count = parseInt(value, 10)
            break
          case 'UNTIL':
            components.until = new Date(value)
            break
        }
      }

      if (!components.freq) return null
      return components as RRuleComponents
    } catch {
      return null
    }
  }

  private formatOccurrenceDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private toResponseDto(schedule: {
    id: number
    classId: number
    startTimeUtc: Date
    endTimeUtc: Date
    localTimezone: string
    recurrenceRule: string | null
    occurrenceDate: string | null
    parentScheduleId: number | null
    isCancelled: boolean
    cancelledAt: Date | null
    cancelReason: string | null
    createdAt: Date
    class?: {
      id: number
      title: string
      capacity: number | null
      waitlistLimit: number | null
      isCapacitySoft: boolean
    }
    bookingCounts?: {
      booked: number
      waitlisted: number
    }
  }): ClassScheduleResponseDto {
    return {
      id: schedule.id,
      classId: schedule.classId,
      startTimeUtc: schedule.startTimeUtc,
      endTimeUtc: schedule.endTimeUtc,
      localTimezone: schedule.localTimezone,
      recurrenceRule: schedule.recurrenceRule,
      occurrenceDate: schedule.occurrenceDate,
      parentScheduleId: schedule.parentScheduleId,
      isCancelled: schedule.isCancelled,
      cancelledAt: schedule.cancelledAt,
      cancelReason: schedule.cancelReason,
      createdAt: schedule.createdAt,
      ...(schedule.class && { class: schedule.class }),
      ...(schedule.bookingCounts && { bookingCounts: schedule.bookingCounts }),
    }
  }
}
