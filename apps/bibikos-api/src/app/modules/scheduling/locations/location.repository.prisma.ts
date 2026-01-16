import { Location, Prisma } from '@js-monorepo/bibikos-db'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { LocationRepository } from './location.repository'

@Injectable()
export class LocationRepositoryPrisma implements LocationRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findById(id: number): Promise<Location | null> {
    return this.txHost.tx.location.findUnique({
      where: { id },
    })
  }

  async findByOrganizerId(organizerId: number, includeInactive = false): Promise<Location[]> {
    return this.txHost.tx.location.findMany({
      where: {
        organizerId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { name: 'asc' },
    })
  }

  async create(data: Prisma.LocationCreateInput): Promise<Location> {
    return this.txHost.tx.location.create({ data })
  }

  async update(id: number, data: Prisma.LocationUpdateInput): Promise<Location> {
    return this.txHost.tx.location.update({
      where: { id },
      data,
    })
  }

  async delete(id: number): Promise<void> {
    await this.txHost.tx.location.delete({
      where: { id },
    })
  }
}
