import { Class, Prisma } from '@js-monorepo/bibikos-db'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { ClassRepository, ClassWithLocation, ClassWithLocationAndOrganizer } from './class.repository'

@Injectable()
export class ClassRepositoryPrisma implements ClassRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findById(id: number): Promise<Class | null> {
    return this.txHost.tx.class.findUnique({
      where: { id },
    })
  }

  async findByIdWithLocation(id: number): Promise<ClassWithLocation | null> {
    return this.txHost.tx.class.findUnique({
      where: { id },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            timezone: true,
            isOnline: true,
          },
        },
      },
    })
  }

  async findByIdWithLocationAndOrganizer(id: number): Promise<ClassWithLocationAndOrganizer | null> {
    return this.txHost.tx.class.findUnique({
      where: { id },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            timezone: true,
            isOnline: true,
          },
        },
        organizer: {
          select: {
            id: true,
            displayName: true,
            slug: true,
            activityLabel: true,
          },
        },
      },
    })
  }

  async findByOrganizerId(organizerId: number, includeInactive = false): Promise<ClassWithLocation[]> {
    return this.txHost.tx.class.findMany({
      where: {
        organizerId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            timezone: true,
            isOnline: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    })
  }

  async create(data: Prisma.ClassCreateInput): Promise<Class> {
    return this.txHost.tx.class.create({ data })
  }

  async update(id: number, data: Prisma.ClassUpdateInput): Promise<Class> {
    return this.txHost.tx.class.update({
      where: { id },
      data,
    })
  }

  async countByOrganizerId(organizerId: number, includeInactive = false): Promise<number> {
    return this.txHost.tx.class.count({
      where: {
        organizerId,
        ...(includeInactive ? {} : { isActive: true }),
      },
    })
  }
}
