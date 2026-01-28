import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { TagEntityType as PrismaTagEntityType } from '@js-monorepo/bibikos-db'
import {
  CreateTagCategoryInput,
  CreateTagInput,
  TagCategoryEntity,
  TagCategoryRepository,
  TagEntityType,
  TagRepository,
  TagWithCategory,
  UpdateTagCategoryInput,
  UpdateTagInput,
} from './tag.repository'

// =============================================================================
// Tag Category Repository Implementation
// =============================================================================

@Injectable()
export class TagCategoryRepositoryPrisma implements TagCategoryRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findAll(): Promise<TagCategoryEntity[]> {
    return this.txHost.tx.tagCategory.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: number): Promise<TagCategoryEntity | null> {
    return this.txHost.tx.tagCategory.findUnique({
      where: { id },
    })
  }

  async findBySlug(slug: string): Promise<TagCategoryEntity | null> {
    return this.txHost.tx.tagCategory.findUnique({
      where: { slug },
    })
  }

  async create(data: CreateTagCategoryInput): Promise<TagCategoryEntity> {
    return this.txHost.tx.tagCategory.create({ data })
  }

  async update(id: number, data: UpdateTagCategoryInput): Promise<TagCategoryEntity> {
    return this.txHost.tx.tagCategory.update({
      where: { id },
      data,
    })
  }

  async delete(id: number): Promise<void> {
    await this.txHost.tx.tagCategory.delete({
      where: { id },
    })
  }
}

// =============================================================================
// Tag Repository Implementation
// =============================================================================

@Injectable()
export class TagRepositoryPrisma implements TagRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findAll(): Promise<TagWithCategory[]> {
    return this.txHost.tx.tag.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: number): Promise<TagWithCategory | null> {
    return this.txHost.tx.tag.findUnique({
      where: { id },
      include: { category: true },
    })
  }

  async findByName(name: string): Promise<TagWithCategory | null> {
    return this.txHost.tx.tag.findUnique({
      where: { name },
      include: { category: true },
    })
  }

  async findByIds(ids: number[]): Promise<TagWithCategory[]> {
    return this.txHost.tx.tag.findMany({
      where: { id: { in: ids } },
      include: { category: true },
      orderBy: { name: 'asc' },
    })
  }

  async findByCategoryId(categoryId: number): Promise<TagWithCategory[]> {
    return this.txHost.tx.tag.findMany({
      where: { categoryId },
      include: { category: true },
      orderBy: { name: 'asc' },
    })
  }

  async findByEntityType(entityType: TagEntityType): Promise<TagWithCategory[]> {
    return this.txHost.tx.tag.findMany({
      where: { applicableTo: { has: entityType as PrismaTagEntityType } },
      include: { category: true },
      orderBy: { name: 'asc' },
    })
  }

  async create(data: CreateTagInput): Promise<TagWithCategory> {
    return this.txHost.tx.tag.create({
      data: {
        name: data.name,
        applicableTo: (data.applicableTo ?? []) as PrismaTagEntityType[],
        ...(data.categoryId && {
          category: { connect: { id: data.categoryId } },
        }),
      },
      include: { category: true },
    })
  }

  async update(id: number, data: UpdateTagInput): Promise<TagWithCategory> {
    return this.txHost.tx.tag.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.applicableTo !== undefined && { applicableTo: data.applicableTo as PrismaTagEntityType[] }),
        ...(data.categoryId !== undefined && {
          category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
        }),
      },
      include: { category: true },
    })
  }

  async delete(id: number): Promise<void> {
    await this.txHost.tx.tag.delete({
      where: { id },
    })
  }
}
