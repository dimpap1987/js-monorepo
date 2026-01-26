import { ClassSchedule, Prisma } from '@js-monorepo/bibikos-db'

export const ClassScheduleRepo = Symbol('ClassScheduleRepo')

export interface ClassScheduleWithClass extends ClassSchedule {
  class: {
    id: number
    title: string
    capacity: number | null
    waitlistLimit: number | null
    isCapacitySoft: boolean
    organizerId: number
    location?: {
      id: number
      name: string
    }
  }
}

export interface ClassScheduleWithBookingCounts extends ClassScheduleWithClass {
  _count: {
    bookings: number
  }
  bookingCounts?: {
    booked: number
    waitlisted: number
  }
}

export interface DiscoverScheduleResult extends ClassScheduleWithBookingCounts {
  organizer: {
    id: number
    displayName: string | null
    slug: string | null
  }
  tags: Array<{
    id: number
    name: string
  }>
}

export interface DiscoverCursorFilters {
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  search?: string
  tagIds?: number[]
}

export interface DiscoverCursorResult {
  schedules: DiscoverScheduleResult[]
  hasMore: boolean
}

/**
 * A group of schedules from the same class on the same day
 */
export interface DiscoverClassGroup {
  classId: number
  date: string // YYYY-MM-DD in local timezone
  title: string
  capacity: number | null
  waitlistLimit: number | null
  location: { id: number; name: string } | null
  organizer: { id: number; displayName: string | null; slug: string | null }
  tags: Array<{ id: number; name: string }>
  schedules: Array<{
    id: number
    startTimeUtc: Date
    endTimeUtc: Date
    localTimezone: string
    bookingCounts: { booked: number; waitlisted: number }
  }>
}

export interface DiscoverGroupedCursorResult {
  groups: DiscoverClassGroup[]
  hasMore: boolean
  /** Cursor format: "classId:date:scheduleId" to resume from the last group's last schedule */
  lastCursor: string | null
}

export interface ClassScheduleRepository {
  findById(id: number): Promise<ClassSchedule | null>
  findByIdWithClass(id: number): Promise<ClassScheduleWithClass | null>
  findByClassId(classId: number, options?: { includeCancelled?: boolean }): Promise<ClassSchedule[]>
  findByOrganizerIdInRange(
    organizerId: number,
    startDate: Date,
    endDate: Date,
    classId?: number,
    includeCancelledWithBookings?: boolean
  ): Promise<ClassScheduleWithBookingCounts[]>
  findPublicByOrganizerIdInRange(
    organizerId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ClassScheduleWithBookingCounts[]>
  findUpcomingByClassId(classId: number, limit?: number): Promise<ClassSchedule[]>
  findUpcomingByClassIdWithBookingCounts(classId: number, limit?: number): Promise<ClassScheduleWithBookingCounts[]>
  /**
   * Cursor-based pagination for discover page
   * Returns public schedules + private schedules where user has accepted invitation
   * Ordered by startTimeUtc ASC, id ASC for stable cursor pagination
   */
  findForDiscoverByCursor(
    filters: DiscoverCursorFilters,
    cursor: number | null,
    limit: number,
    appUserId?: number
  ): Promise<DiscoverCursorResult>
  /**
   * Cursor-based pagination for discover page with grouping by class+date
   * Returns groups of schedules from the same class on the same day
   * Pagination is at the group level
   */
  findForDiscoverGroupedByCursor(
    filters: DiscoverCursorFilters,
    cursor: string | null,
    limit: number,
    appUserId?: number
  ): Promise<DiscoverGroupedCursorResult>
  create(data: Prisma.ClassScheduleCreateInput): Promise<ClassSchedule>
  createMany(data: Prisma.ClassScheduleCreateManyInput[]): Promise<number>
  update(id: number, data: Prisma.ClassScheduleUpdateInput): Promise<ClassSchedule>
  deleteByParentScheduleId(parentScheduleId: number, afterDate?: Date): Promise<number>
  /**
   * Find all future schedules in a recurring series (including the given schedule)
   * Works from any schedule in the series (parent or child)
   */
  findFutureInSeries(scheduleId: number, fromDate: Date): Promise<ClassSchedule[]>
  /**
   * Cancel multiple schedules by IDs
   */
  cancelMany(ids: number[], cancelReason: string | null): Promise<number>
}
