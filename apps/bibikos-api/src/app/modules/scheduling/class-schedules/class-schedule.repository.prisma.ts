import { BookingStatus, ClassSchedule, Prisma } from '@js-monorepo/bibikos-db'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import {
  ClassScheduleRepository,
  ClassScheduleWithBookingCounts,
  ClassScheduleWithClass,
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
    classId?: number
  ): Promise<ClassScheduleWithBookingCounts[]> {
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

    return schedules.map((schedule) => ({
      ...schedule,
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
}
