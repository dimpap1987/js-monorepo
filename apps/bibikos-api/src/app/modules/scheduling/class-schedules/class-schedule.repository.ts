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
    activityLabel: string | null
  }
}

export interface DiscoverFilters {
  startDate: Date
  endDate: Date
  activity?: string
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  search?: string
}

export interface ClassScheduleRepository {
  findById(id: number): Promise<ClassSchedule | null>
  findByIdWithClass(id: number): Promise<ClassScheduleWithClass | null>
  findByClassId(classId: number, options?: { includeCancelled?: boolean }): Promise<ClassSchedule[]>
  findByOrganizerIdInRange(
    organizerId: number,
    startDate: Date,
    endDate: Date,
    classId?: number
  ): Promise<ClassScheduleWithBookingCounts[]>
  findPublicByOrganizerIdInRange(
    organizerId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ClassScheduleWithBookingCounts[]>
  findUpcomingByClassId(classId: number, limit?: number): Promise<ClassSchedule[]>
  findPublicForDiscover(filters: DiscoverFilters): Promise<DiscoverScheduleResult[]>
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
