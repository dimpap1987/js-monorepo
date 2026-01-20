import { BookingStatus, ClassSchedule, InvitationStatus, Prisma } from '@js-monorepo/bibikos-db'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import {
  ClassScheduleRepository,
  ClassScheduleWithBookingCounts,
  ClassScheduleWithClass,
  DiscoverFilters,
  DiscoverScheduleResult,
} from './class-schedule.repository'

@Injectable()
export class ClassScheduleRepositoryPrisma implements ClassScheduleRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findById(id: number): Promise<ClassSchedule | null> {
    return this.txHost.tx.classSchedule.findUnique({
      where: { id },
    })
  }

  async findByIdWithClass(id: number): Promise<ClassScheduleWithClass | null> {
    return this.txHost.tx.classSchedule.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            title: true,
            capacity: true,
            waitlistLimit: true,
            isCapacitySoft: true,
            organizerId: true,
          },
        },
      },
    })
  }

  async findByClassId(classId: number, options?: { includeCancelled?: boolean }): Promise<ClassSchedule[]> {
    return this.txHost.tx.classSchedule.findMany({
      where: {
        classId,
        ...(options?.includeCancelled ? {} : { isCancelled: false }),
      },
      orderBy: { startTimeUtc: 'asc' },
    })
  }

  async findByOrganizerIdInRange(
    organizerId: number,
    startDate: Date,
    endDate: Date,
    classId?: number,
    includeCancelledWithBookings = false
  ): Promise<ClassScheduleWithBookingCounts[]> {
    // If includeCancelledWithBookings is true, we need to include cancelled schedules that have bookings
    // We'll filter them after fetching if needed
    const schedules = await this.txHost.tx.classSchedule.findMany({
      where: {
        class: {
          organizerId,
          isActive: true,
          ...(classId ? { id: classId } : {}),
        },
        startTimeUtc: {
          gte: startDate,
          lte: endDate,
        },
        ...(includeCancelledWithBookings
          ? {} // Include all schedules (cancelled and non-cancelled)
          : { isCancelled: false }), // Only non-cancelled schedules
      },
      include: {
        class: {
          select: {
            id: true,
            title: true,
            capacity: true,
            waitlistLimit: true,
            isCapacitySoft: true,
            organizerId: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { startTimeUtc: 'asc' },
    })

    // Get booking counts by status for each schedule
    const scheduleIds = schedules.map((s) => s.id)
    const bookingCounts = await this.txHost.tx.booking.groupBy({
      by: ['classScheduleId', 'status'],
      where: {
        classScheduleId: { in: scheduleIds },
        status: { in: [BookingStatus.BOOKED, BookingStatus.WAITLISTED] },
      },
      _count: true,
    })

    // Map counts to schedules
    const countsMap = new Map<number, { booked: number; waitlisted: number }>()
    for (const count of bookingCounts) {
      const existing = countsMap.get(count.classScheduleId) || { booked: 0, waitlisted: 0 }
      if (count.status === BookingStatus.BOOKED) {
        existing.booked = count._count
      } else if (count.status === BookingStatus.WAITLISTED) {
        existing.waitlisted = count._count
      }
      countsMap.set(count.classScheduleId, existing)
    }

    // Explicitly map all fields to ensure they're included in the response
    // Prisma models may have non-enumerable properties that don't spread correctly
    return schedules.map((schedule) => {
      const result = {
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
        updatedAt: schedule.updatedAt,
        class: schedule.class,
        _count: schedule._count,
        bookingCounts: countsMap.get(schedule.id) || { booked: 0, waitlisted: 0 },
      }
      return result
    })
  }

  async findPublicByOrganizerIdInRange(
    organizerId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ClassScheduleWithBookingCounts[]> {
    const schedules = await this.txHost.tx.classSchedule.findMany({
      where: {
        class: {
          organizerId,
          isActive: true,
          isPrivate: false, // Exclude private classes from public view
        },
        startTimeUtc: {
          gte: startDate,
          lte: endDate,
        },
        isCancelled: false,
      },
      include: {
        class: {
          select: {
            id: true,
            title: true,
            capacity: true,
            waitlistLimit: true,
            isCapacitySoft: true,
            organizerId: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { startTimeUtc: 'asc' },
    })

    const scheduleIds = schedules.map((s) => s.id)
    const bookingCounts = await this.txHost.tx.booking.groupBy({
      by: ['classScheduleId', 'status'],
      where: {
        classScheduleId: { in: scheduleIds },
        status: { in: [BookingStatus.BOOKED, BookingStatus.WAITLISTED] },
      },
      _count: true,
    })

    const countsMap = new Map<number, { booked: number; waitlisted: number }>()
    for (const count of bookingCounts) {
      const existing = countsMap.get(count.classScheduleId) || { booked: 0, waitlisted: 0 }
      if (count.status === BookingStatus.BOOKED) {
        existing.booked = count._count
      } else if (count.status === BookingStatus.WAITLISTED) {
        existing.waitlisted = count._count
      }
      countsMap.set(count.classScheduleId, existing)
    }

    return schedules.map((schedule) => ({
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
      updatedAt: schedule.updatedAt,
      class: schedule.class,
      _count: schedule._count,
      bookingCounts: countsMap.get(schedule.id) || { booked: 0, waitlisted: 0 },
    }))
  }

  async findUpcomingByClassId(classId: number, limit = 10): Promise<ClassSchedule[]> {
    return this.txHost.tx.classSchedule.findMany({
      where: {
        classId,
        startTimeUtc: { gte: new Date() },
        isCancelled: false,
      },
      orderBy: { startTimeUtc: 'asc' },
      take: limit,
    })
  }

  async findUpcomingByClassIdWithBookingCounts(classId: number, limit = 10): Promise<ClassScheduleWithBookingCounts[]> {
    const schedules = await this.txHost.tx.classSchedule.findMany({
      where: {
        classId,
        startTimeUtc: { gte: new Date() },
        isCancelled: false,
      },
      include: {
        class: {
          select: {
            id: true,
            title: true,
            capacity: true,
            waitlistLimit: true,
            isCapacitySoft: true,
            organizerId: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { startTimeUtc: 'asc' },
      take: limit,
    })

    const scheduleIds = schedules.map((s) => s.id)
    const bookingCounts = await this.txHost.tx.booking.groupBy({
      by: ['classScheduleId', 'status'],
      where: {
        classScheduleId: { in: scheduleIds },
        status: { in: [BookingStatus.BOOKED, BookingStatus.WAITLISTED] },
      },
      _count: true,
    })

    const countsMap = new Map<number, { booked: number; waitlisted: number }>()
    for (const count of bookingCounts) {
      const existing = countsMap.get(count.classScheduleId) || { booked: 0, waitlisted: 0 }
      if (count.status === BookingStatus.BOOKED) {
        existing.booked = count._count
      } else if (count.status === BookingStatus.WAITLISTED) {
        existing.waitlisted = count._count
      }
      countsMap.set(count.classScheduleId, existing)
    }

    return schedules.map((schedule) => ({
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
      updatedAt: schedule.updatedAt,
      class: schedule.class,
      _count: schedule._count,
      bookingCounts: countsMap.get(schedule.id) || { booked: 0, waitlisted: 0 },
    }))
  }

  async findPublicForDiscover(filters: DiscoverFilters): Promise<DiscoverScheduleResult[]> {
    const { startDate, endDate, activity, timeOfDay, search } = filters

    // Note: timeOfDay filter is applied in memory after fetching since it depends on local timezone

    // Build search filter
    const searchFilter: Prisma.ClassScheduleWhereInput = search
      ? {
          OR: [
            { class: { title: { contains: search, mode: 'insensitive' } } },
            { class: { organizer: { displayName: { contains: search, mode: 'insensitive' } } } },
          ],
        }
      : {}

    const schedules = await this.txHost.tx.classSchedule.findMany({
      where: {
        class: {
          isActive: true,
          isPrivate: false, // Exclude private classes from discover
          ...(activity ? { organizer: { activityLabel: { equals: activity, mode: 'insensitive' } } } : {}),
        },
        startTimeUtc: {
          gte: startDate,
          lte: endDate,
        },
        isCancelled: false,
        ...searchFilter,
      },
      include: {
        class: {
          select: {
            id: true,
            title: true,
            capacity: true,
            waitlistLimit: true,
            isCapacitySoft: true,
            organizerId: true,
            organizer: {
              select: {
                id: true,
                displayName: true,
                slug: true,
                activityLabel: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { startTimeUtc: 'asc' },
      take: 100, // Limit results
    })

    // Get booking counts
    const scheduleIds = schedules.map((s) => s.id)
    const bookingCounts = await this.txHost.tx.booking.groupBy({
      by: ['classScheduleId', 'status'],
      where: {
        classScheduleId: { in: scheduleIds },
        status: { in: [BookingStatus.BOOKED, BookingStatus.WAITLISTED] },
      },
      _count: true,
    })

    const countsMap = new Map<number, { booked: number; waitlisted: number }>()
    for (const count of bookingCounts) {
      const existing = countsMap.get(count.classScheduleId) || { booked: 0, waitlisted: 0 }
      if (count.status === BookingStatus.BOOKED) {
        existing.booked = count._count
      } else if (count.status === BookingStatus.WAITLISTED) {
        existing.waitlisted = count._count
      }
      countsMap.set(count.classScheduleId, existing)
    }

    // Map and filter by time of day if specified
    let results = schedules.map((schedule) => {
      const { organizer, ...classWithoutOrganizer } = schedule.class
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
        updatedAt: schedule.updatedAt,
        class: classWithoutOrganizer,
        _count: schedule._count,
        bookingCounts: countsMap.get(schedule.id) || { booked: 0, waitlisted: 0 },
        organizer,
      }
    })

    // Filter by time of day in memory (based on local timezone)
    if (timeOfDay) {
      results = results.filter((schedule) => {
        const hour = schedule.startTimeUtc.getUTCHours()
        // Approximate time of day in UTC (could be improved with timezone conversion)
        switch (timeOfDay) {
          case 'morning':
            return hour >= 5 && hour < 12
          case 'afternoon':
            return hour >= 12 && hour < 17
          case 'evening':
            return hour >= 17 || hour < 5
          default:
            return true
        }
      })
    }

    return results
  }

  async findPrivateForDiscoverByUserId(userId: number, filters: DiscoverFilters): Promise<DiscoverScheduleResult[]> {
    const { startDate, endDate, activity, timeOfDay, search } = filters

    // Build search filter
    const searchFilter: Prisma.ClassScheduleWhereInput = search
      ? {
          OR: [
            { class: { title: { contains: search, mode: 'insensitive' } } },
            { class: { organizer: { displayName: { contains: search, mode: 'insensitive' } } } },
          ],
        }
      : {}

    // Find private classes where user has accepted invitation
    const schedules = await this.txHost.tx.classSchedule.findMany({
      where: {
        class: {
          isActive: true,
          isPrivate: true, // Only private classes
          invitations: {
            some: {
              invitedUserId: userId,
              status: InvitationStatus.ACCEPTED,
            },
          },
          ...(activity ? { organizer: { activityLabel: { equals: activity, mode: 'insensitive' } } } : {}),
        },
        startTimeUtc: {
          gte: startDate,
          lte: endDate,
        },
        isCancelled: false,
        ...searchFilter,
      },
      include: {
        class: {
          select: {
            id: true,
            title: true,
            capacity: true,
            waitlistLimit: true,
            isCapacitySoft: true,
            organizerId: true,
            organizer: {
              select: {
                id: true,
                displayName: true,
                slug: true,
                activityLabel: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { startTimeUtc: 'asc' },
      take: 100,
    })

    // Get booking counts
    const scheduleIds = schedules.map((s) => s.id)
    const bookingCounts = await this.txHost.tx.booking.groupBy({
      by: ['classScheduleId', 'status'],
      where: {
        classScheduleId: { in: scheduleIds },
        status: { in: [BookingStatus.BOOKED, BookingStatus.WAITLISTED] },
      },
      _count: true,
    })

    const countsMap = new Map<number, { booked: number; waitlisted: number }>()
    for (const count of bookingCounts) {
      const existing = countsMap.get(count.classScheduleId) || { booked: 0, waitlisted: 0 }
      if (count.status === BookingStatus.BOOKED) {
        existing.booked = count._count
      } else if (count.status === BookingStatus.WAITLISTED) {
        existing.waitlisted = count._count
      }
      countsMap.set(count.classScheduleId, existing)
    }

    // Map results
    let results = schedules.map((schedule) => {
      const { organizer, ...classWithoutOrganizer } = schedule.class
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
        updatedAt: schedule.updatedAt,
        class: classWithoutOrganizer,
        _count: schedule._count,
        bookingCounts: countsMap.get(schedule.id) || { booked: 0, waitlisted: 0 },
        organizer,
      }
    })

    // Filter by time of day in memory
    if (timeOfDay) {
      results = results.filter((schedule) => {
        const hour = schedule.startTimeUtc.getUTCHours()
        switch (timeOfDay) {
          case 'morning':
            return hour >= 5 && hour < 12
          case 'afternoon':
            return hour >= 12 && hour < 17
          case 'evening':
            return hour >= 17 || hour < 5
          default:
            return true
        }
      })
    }

    return results
  }

  async create(data: Prisma.ClassScheduleCreateInput): Promise<ClassSchedule> {
    return this.txHost.tx.classSchedule.create({ data })
  }

  async createMany(data: Prisma.ClassScheduleCreateManyInput[]): Promise<number> {
    const result = await this.txHost.tx.classSchedule.createMany({ data })
    return result.count
  }

  async update(id: number, data: Prisma.ClassScheduleUpdateInput): Promise<ClassSchedule> {
    return this.txHost.tx.classSchedule.update({
      where: { id },
      data,
    })
  }

  async deleteByParentScheduleId(parentScheduleId: number, afterDate?: Date): Promise<number> {
    const result = await this.txHost.tx.classSchedule.deleteMany({
      where: {
        parentScheduleId,
        ...(afterDate ? { startTimeUtc: { gte: afterDate } } : {}),
      },
    })
    return result.count
  }

  async findFutureInSeries(scheduleId: number, fromDate: Date): Promise<ClassSchedule[]> {
    // First, get the schedule to determine if it's a parent or child
    const schedule = await this.txHost.tx.classSchedule.findUnique({
      where: { id: scheduleId },
    })

    if (!schedule) return []

    // Determine the parent schedule ID
    // If schedule has parentScheduleId, it's a child; otherwise it might be a parent
    const parentId = schedule.parentScheduleId ?? schedule.id

    // Find all schedules in the series (parent + children) that are:
    // 1. Not cancelled
    // 2. Start from the given date onwards
    return this.txHost.tx.classSchedule.findMany({
      where: {
        OR: [
          { id: parentId }, // Include the parent
          { parentScheduleId: parentId }, // Include all children
        ],
        startTimeUtc: { gte: fromDate },
        isCancelled: false,
      },
      orderBy: { startTimeUtc: 'asc' },
    })
  }

  async cancelMany(ids: number[], cancelReason: string | null): Promise<number> {
    const result = await this.txHost.tx.classSchedule.updateMany({
      where: {
        id: { in: ids },
        isCancelled: false,
      },
      data: {
        isCancelled: true,
        cancelledAt: new Date(),
        cancelReason,
      },
    })
    return result.count
  }
}
