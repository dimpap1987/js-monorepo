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
