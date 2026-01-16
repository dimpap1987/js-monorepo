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
  findUpcomingByClassId(classId: number, limit?: number): Promise<ClassSchedule[]>
  create(data: Prisma.ClassScheduleCreateInput): Promise<ClassSchedule>
  createMany(data: Prisma.ClassScheduleCreateManyInput[]): Promise<number>
  update(id: number, data: Prisma.ClassScheduleUpdateInput): Promise<ClassSchedule>
  deleteByParentScheduleId(parentScheduleId: number, afterDate?: Date): Promise<number>
}
