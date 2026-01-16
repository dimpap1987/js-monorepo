import { Booking, BookingStatus, Prisma } from '@js-monorepo/bibikos-db'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { BookingRepository, BookingWithAll, BookingWithParticipant, BookingWithSchedule } from './booking.repository'

@Injectable()
export class BookingRepositoryPrisma implements BookingRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findById(id: number): Promise<Booking | null> {
    return this.txHost.tx.booking.findUnique({
      where: { id },
    })
  }

  async findByIdWithAll(id: number): Promise<BookingWithAll | null> {
    return this.txHost.tx.booking.findUnique({
      where: { id },
      include: {
        participant: {
          include: {
            appUser: {
              include: {
                authUser: {
                  select: {
                    email: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
        classSchedule: {
          include: {
            class: {
              select: {
                id: true,
                title: true,
                organizerId: true,
              },
            },
          },
        },
      },
    })
  }

  async findByScheduleId(scheduleId: number, statuses?: BookingStatus[]): Promise<BookingWithParticipant[]> {
    return this.txHost.tx.booking.findMany({
      where: {
        classScheduleId: scheduleId,
        ...(statuses ? { status: { in: statuses } } : {}),
      },
      include: {
        participant: {
          include: {
            appUser: {
              include: {
                authUser: {
                  select: {
                    email: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // BOOKED first, then WAITLISTED
        { waitlistPosition: 'asc' },
        { bookedAt: 'asc' },
      ],
    })
  }

  async findByParticipantId(
    participantId: number,
    options?: {
      upcoming?: boolean
      past?: boolean
      statuses?: BookingStatus[]
    }
  ): Promise<BookingWithSchedule[]> {
    const now = new Date()

    return this.txHost.tx.booking.findMany({
      where: {
        participantId,
        ...(options?.statuses ? { status: { in: options.statuses } } : {}),
        ...(options?.upcoming ? { classSchedule: { startTimeUtc: { gte: now } } } : {}),
        ...(options?.past ? { classSchedule: { startTimeUtc: { lt: now } } } : {}),
      },
      include: {
        classSchedule: {
          include: {
            class: {
              select: {
                id: true,
                title: true,
                organizerId: true,
              },
            },
          },
        },
      },
      orderBy: {
        classSchedule: {
          startTimeUtc: options?.past ? 'desc' : 'asc',
        },
      },
    })
  }

  async findByScheduleAndParticipant(scheduleId: number, participantId: number): Promise<Booking | null> {
    return this.txHost.tx.booking.findUnique({
      where: {
        classScheduleId_participantId: {
          classScheduleId: scheduleId,
          participantId,
        },
      },
    })
  }

  async countByScheduleId(scheduleId: number, statuses: BookingStatus[]): Promise<number> {
    return this.txHost.tx.booking.count({
      where: {
        classScheduleId: scheduleId,
        status: { in: statuses },
      },
    })
  }

  async getMaxWaitlistPosition(scheduleId: number): Promise<number> {
    const result = await this.txHost.tx.booking.aggregate({
      where: {
        classScheduleId: scheduleId,
        status: BookingStatus.WAITLISTED,
      },
      _max: {
        waitlistPosition: true,
      },
    })
    return result._max.waitlistPosition || 0
  }

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return this.txHost.tx.booking.create({ data })
  }

  async update(id: number, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return this.txHost.tx.booking.update({
      where: { id },
      data,
    })
  }

  async updateMany(ids: number[], data: Prisma.BookingUpdateInput): Promise<number> {
    const result = await this.txHost.tx.booking.updateMany({
      where: { id: { in: ids } },
      data,
    })
    return result.count
  }

  async getNextWaitlistedBooking(scheduleId: number): Promise<Booking | null> {
    return this.txHost.tx.booking.findFirst({
      where: {
        classScheduleId: scheduleId,
        status: BookingStatus.WAITLISTED,
      },
      orderBy: {
        waitlistPosition: 'asc',
      },
    })
  }

  async decrementWaitlistPositions(scheduleId: number, abovePosition: number): Promise<number> {
    const result = await this.txHost.tx.booking.updateMany({
      where: {
        classScheduleId: scheduleId,
        status: BookingStatus.WAITLISTED,
        waitlistPosition: { gt: abovePosition },
      },
      data: {
        waitlistPosition: { decrement: 1 },
      },
    })
    return result.count
  }
}
