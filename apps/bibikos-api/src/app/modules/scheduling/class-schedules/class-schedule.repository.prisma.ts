import { BookingStatus, ClassSchedule, InvitationStatus, Prisma } from '@js-monorepo/bibikos-db'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import {
  ClassScheduleRepository,
  ClassScheduleWithBookingCounts,
  ClassScheduleWithClass,
  DiscoverCursorFilters,
  DiscoverCursorResult,
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
            location: {
              select: {
                id: true,
                name: true,
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

  async findForDiscoverByCursor(
    filters: DiscoverCursorFilters,
    cursor: number | null,
    limit: number,
    appUserId?: number
  ): Promise<DiscoverCursorResult> {
    const { timeOfDay, search, tagIds } = filters
    const now = new Date()

    // Build search filter
    const searchFilter: Prisma.ClassScheduleWhereInput = search
      ? {
          OR: [
            { class: { title: { contains: search, mode: 'insensitive' } } },
            { class: { organizer: { displayName: { contains: search, mode: 'insensitive' } } } },
          ],
        }
      : {}

    // Build tag filter
    const tagFilter: Prisma.ClassScheduleWhereInput =
      tagIds && tagIds.length > 0
        ? {
            class: {
              tags: {
                some: {
                  tagId: { in: tagIds },
                },
              },
            },
          }
        : {}

    // Build cursor condition
    // Use endTimeUtc >= now to include schedules that haven't ended yet (shows "today" schedules that started earlier)
    let cursorCondition: Prisma.ClassScheduleWhereInput = { endTimeUtc: { gte: now } }
    if (cursor !== null) {
      // Fetch cursor schedule to get its startTimeUtc
      const cursorSchedule = await this.txHost.tx.classSchedule.findUnique({
        where: { id: cursor },
        select: { startTimeUtc: true },
      })

      if (cursorSchedule) {
        // Get schedules after cursor: (startTimeUtc > cursorTime) OR (startTimeUtc = cursorTime AND id > cursorId)
        cursorCondition = {
          AND: [
            { endTimeUtc: { gte: now } },
            {
              OR: [
                { startTimeUtc: { gt: cursorSchedule.startTimeUtc } },
                {
                  AND: [{ startTimeUtc: cursorSchedule.startTimeUtc }, { id: { gt: cursor } }],
                },
              ],
            },
          ],
        }
      }
    }

    // Build visibility filter: public classes OR private classes with accepted invitation
    const visibilityFilter: Prisma.ClassScheduleWhereInput = appUserId
      ? {
          OR: [
            // Public classes
            { class: { isPrivate: false } },
            // Private classes where user has accepted invitation
            {
              class: {
                isPrivate: true,
                invitations: {
                  some: {
                    invitedUserId: appUserId,
                    status: InvitationStatus.ACCEPTED,
                  },
                },
              },
            },
          ],
        }
      : { class: { isPrivate: false } }

    // Fetch limit + 1 to determine hasMore
    const schedules = await this.txHost.tx.classSchedule.findMany({
      where: {
        class: {
          isActive: true,
        },
        isCancelled: false,
        ...cursorCondition,
        ...visibilityFilter,
        ...searchFilter,
        ...tagFilter,
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
            location: {
              select: {
                id: true,
                name: true,
              },
            },
            organizer: {
              select: {
                id: true,
                displayName: true,
                slug: true,
              },
            },
            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
      orderBy: [{ startTimeUtc: 'asc' }, { id: 'asc' }],
      take: limit + 1,
    })

    const hasMore = schedules.length > limit
    const resultSchedules = hasMore ? schedules.slice(0, limit) : schedules

    // Filter by time of day in memory (based on UTC hours approximation)
    let filteredSchedules = resultSchedules
    if (timeOfDay) {
      filteredSchedules = resultSchedules.filter((schedule) => {
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

    // Get booking counts
    const scheduleIds = filteredSchedules.map((s) => s.id)
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
    const results = filteredSchedules.map((schedule) => {
      const { organizer, tags, ...classWithoutOrganizerAndTags } = schedule.class
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
        class: classWithoutOrganizerAndTags,
        _count: schedule._count,
        bookingCounts: countsMap.get(schedule.id) || { booked: 0, waitlisted: 0 },
        organizer,
        tags: tags.map((t) => t.tag),
      }
    })

    return {
      schedules: results,
      hasMore,
    }
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
