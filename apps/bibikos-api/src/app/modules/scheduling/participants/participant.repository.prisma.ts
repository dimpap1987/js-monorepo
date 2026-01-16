import { ParticipantProfile, Prisma } from '@js-monorepo/bibikos-db'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { ParticipantRepository } from './participant.repository'

@Injectable()
export class ParticipantRepositoryPrisma implements ParticipantRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findById(id: number): Promise<ParticipantProfile | null> {
    return this.txHost.tx.participantProfile.findUnique({
      where: { id },
    })
  }

  async findByAppUserId(appUserId: number): Promise<ParticipantProfile | null> {
    return this.txHost.tx.participantProfile.findUnique({
      where: { appUserId },
    })
  }

  async create(data: Prisma.ParticipantProfileCreateInput): Promise<ParticipantProfile> {
    return this.txHost.tx.participantProfile.create({ data })
  }

  async findByIds(ids: number[]): Promise<ParticipantProfile[]> {
    return this.txHost.tx.participantProfile.findMany({
      where: { id: { in: ids } },
    })
  }
}
