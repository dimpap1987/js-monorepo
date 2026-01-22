import { ClassTag, Prisma } from '@js-monorepo/bibikos-db'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { ClassTagRepository } from './tags.repository'

@Injectable()
export class ClassTagRepositoryPrisma implements ClassTagRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findAll(): Promise<ClassTag[]> {
    return this.txHost.tx.classTag.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: number): Promise<ClassTag | null> {
    return this.txHost.tx.classTag.findUnique({
      where: { id },
    })
  }

  async findByName(name: string): Promise<ClassTag | null> {
    return this.txHost.tx.classTag.findUnique({
      where: { name },
    })
  }

  async create(data: Prisma.ClassTagCreateInput): Promise<ClassTag> {
    return this.txHost.tx.classTag.create({ data })
  }

  async update(id: number, data: Prisma.ClassTagUpdateInput): Promise<ClassTag> {
    return this.txHost.tx.classTag.update({
      where: { id },
      data,
    })
  }

  async delete(id: number): Promise<void> {
    await this.txHost.tx.classTag.delete({
      where: { id },
    })
  }
}
