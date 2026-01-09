import { PRISMA_SERVICE, BasePrismaService } from '@js-monorepo/prisma-shared'
import { ContactMessageCreateDto, ContactStatus } from '@js-monorepo/types/contact'
import { Pageable } from '@js-monorepo/types/pagination'
import { tryCatch } from '@js-monorepo/utils/common'
import { Transactional } from '@nestjs-cls/transactional'
import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import sanitizeHtml from 'sanitize-html'
import { ContactModuleOptions } from './contact.module'
import { ContactRepo, ContactRepository } from './contact.repository'

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name)

  constructor(
    @Inject(ContactRepo)
    private readonly contactRepository: ContactRepository,
    @Inject(PRISMA_SERVICE) private readonly prisma: BasePrismaService,
    @Optional()
    @Inject('CONTACT_OPTIONS')
    private readonly contactOptions?: ContactModuleOptions
  ) {}

  @Transactional()
  async create(data: ContactMessageCreateDto, userId?: number) {
    let email = data.email

    // For logged-in users, fetch email from database
    if (userId && !email) {
      const user = await this.prisma.authUser.findUnique({
        where: { id: userId },
        select: { email: true },
      })
      email = user?.email || ''
    }

    const message = await this.contactRepository.create(
      {
        ...data,
        email: email || '',
        message: sanitizeHtml(data.message),
      },
      userId
    )
    this.logger.debug(`Created contact message from: ${email}`)

    tryCatch(async () => {
      await this.contactOptions?.onContactMessageCreated?.(message)
    })

    return message
  }

  @Transactional()
  async findAll(pageable: Pageable, status?: ContactStatus) {
    return this.contactRepository.findAll(pageable, status)
  }

  @Transactional()
  async findById(id: number) {
    return this.contactRepository.findById(id)
  }

  @Transactional()
  async updateStatus(id: number, status: ContactStatus) {
    this.logger.debug(`Updating contact message ${id} status to: ${status}`)
    return this.contactRepository.updateStatus(id, status)
  }

  @Transactional()
  async delete(id: number) {
    this.logger.debug(`Deleting contact message: ${id}`)
    return this.contactRepository.delete(id)
  }

  async countUnread() {
    return this.contactRepository.countUnread()
  }
}
