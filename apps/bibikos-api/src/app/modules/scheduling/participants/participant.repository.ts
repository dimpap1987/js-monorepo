import { ParticipantProfile, Prisma } from '@js-monorepo/bibikos-db'

export const ParticipantRepo = Symbol('ParticipantRepo')

export interface ParticipantWithBookingCount extends ParticipantProfile {
  _count: {
    bookings: number
  }
}

export interface ParticipantRepository {
  findById(id: number): Promise<ParticipantProfile | null>
  findByAppUserId(appUserId: number): Promise<ParticipantProfile | null>
  create(data: Prisma.ParticipantProfileCreateInput): Promise<ParticipantProfile>
  findByIds(ids: number[]): Promise<ParticipantProfile[]>
}
