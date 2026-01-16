import { AppUser, Prisma } from '@js-monorepo/bibikos-db'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { AppUserRepository } from './app-user.repository'

@Injectable()
export class AppUserRepositoryPrisma implements AppUserRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findByAuthUserId(authUserId: number): Promise<AppUser | null> {
    return this.txHost.tx.appUser.findUnique({
      where: { authUserId },
    })
  }

  async findById(id: number): Promise<AppUser | null> {
    return this.txHost.tx.appUser.findUnique({
      where: { id },
    })
  }

  async create(data: Prisma.AppUserCreateInput): Promise<AppUser> {
    return this.txHost.tx.appUser.create({ data })
  }

  async update(id: number, data: Prisma.AppUserUpdateInput): Promise<AppUser> {
    return this.txHost.tx.appUser.update({
      where: { id },
      data,
    })
  }

  async upsertByAuthUserId(authUserId: number, data: Omit<Prisma.AppUserCreateInput, 'authUser'>): Promise<AppUser> {
    return this.txHost.tx.appUser.upsert({
      where: { authUserId },
      create: {
        ...data,
        authUser: { connect: { id: authUserId } },
      },
      update: data,
    })
  }
}
