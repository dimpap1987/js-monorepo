import { ContactMessageCreateDto, ContactMessageDto, ContactStatus } from '@js-monorepo/types/contact'
import { Pageable, PaginationType } from '@js-monorepo/types/pagination'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { ContactRepository } from './contact.repository'

@Injectable()
export class ContactRepositoryPrisma implements ContactRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async create(data: ContactMessageCreateDto, userId?: number): Promise<ContactMessageDto> {
    const result = await this.txHost.tx.contactMessage.create({
      data: {
        email: data.email,
        message: data.message,
        category: data.category ?? 'general',
        userId: userId ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    return result as ContactMessageDto
  }

  async findAll(pageable: Pageable, status?: ContactStatus): Promise<PaginationType<ContactMessageDto>> {
    const { page, pageSize } = pageable

    const where = status ? { status } : {}

    const [totalCount, messages] = await Promise.all([
      this.txHost.tx.contactMessage.count({ where }),
      this.txHost.tx.contactMessage.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      content: messages as ContactMessageDto[],
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    }
  }

  async findById(id: number): Promise<ContactMessageDto | null> {
    const result = await this.txHost.tx.contactMessage.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    return result as ContactMessageDto | null
  }

  async updateStatus(id: number, status: ContactStatus): Promise<ContactMessageDto> {
    const result = await this.txHost.tx.contactMessage.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    return result as ContactMessageDto
  }

  async delete(id: number): Promise<void> {
    await this.txHost.tx.contactMessage.delete({
      where: { id },
    })
  }

  async countUnread(): Promise<number> {
    return this.txHost.tx.contactMessage.count({
      where: { status: 'unread' },
    })
  }
}
