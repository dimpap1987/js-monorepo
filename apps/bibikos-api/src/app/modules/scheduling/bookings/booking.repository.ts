import { Booking, BookingStatus, Prisma } from '@js-monorepo/bibikos-db'

export const BookingRepo = Symbol('BookingRepo')

export interface BookingWithParticipant extends Booking {
  participant: {
    id: number
    appUser: {
      id: number
      fullName: string | null
      authUser: {
        email: string
        username: string
      }
    }
  }
}

export interface BookingWithSchedule extends Booking {
  classSchedule: {
    id: number
    startTimeUtc: Date
    endTimeUtc: Date
    class: {
      id: number
      title: string
      organizerId: number
    }
  }
}

export interface BookingWithAll extends Booking {
  participant: {
    id: number
    appUser: {
      id: number
      fullName: string | null
      authUser: {
        email: string
        username: string
      }
    }
  }
  classSchedule: {
    id: number
    startTimeUtc: Date
    endTimeUtc: Date
    class: {
      id: number
      title: string
      organizerId: number
    }
  }
}

export interface BookingRepository {
  findById(id: number): Promise<Booking | null>
  findByIdWithAll(id: number): Promise<BookingWithAll | null>
  findByScheduleId(scheduleId: number, statuses?: BookingStatus[]): Promise<BookingWithParticipant[]>
  findByParticipantId(
    participantId: number,
    options?: {
      upcoming?: boolean
      past?: boolean
      statuses?: BookingStatus[]
    }
  ): Promise<BookingWithSchedule[]>
  findByScheduleAndParticipant(scheduleId: number, participantId: number): Promise<Booking | null>
  findByParticipantAndScheduleIds(
    participantId: number,
    scheduleIds: number[],
    statuses?: BookingStatus[]
  ): Promise<Booking[]>
  countByScheduleId(scheduleId: number, statuses: BookingStatus[]): Promise<number>
  getMaxWaitlistPosition(scheduleId: number): Promise<number>
  create(data: Prisma.BookingCreateInput): Promise<Booking>
  update(id: number, data: Prisma.BookingUpdateInput): Promise<Booking>
  updateMany(ids: number[], data: Prisma.BookingUpdateInput): Promise<number>
  getNextWaitlistedBooking(scheduleId: number): Promise<Booking | null>
  decrementWaitlistPositions(scheduleId: number, abovePosition: number): Promise<number>
  cancelAllByScheduleId(scheduleId: number, cancelReason?: string): Promise<number>
  findByScheduleIds(scheduleIds: number[], statuses?: BookingStatus[]): Promise<Booking[]>
  cancelAllByScheduleIds(scheduleIds: number[], cancelReason?: string): Promise<number>
}
