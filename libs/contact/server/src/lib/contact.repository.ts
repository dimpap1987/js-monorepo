import { ContactMessageCreateDto, ContactMessageDto, ContactStatus } from '@js-monorepo/types/contact'
import { Pageable, PaginationType } from '@js-monorepo/types/pagination'

export const ContactRepo = Symbol('ContactRepo')

export interface ContactRepository {
  create(data: ContactMessageCreateDto, userId?: number): Promise<ContactMessageDto>
  findAll(pageable: Pageable, status?: ContactStatus): Promise<PaginationType<ContactMessageDto>>
  findById(id: number): Promise<ContactMessageDto | null>
  updateStatus(id: number, status: ContactStatus): Promise<ContactMessageDto>
  delete(id: number): Promise<void>
  countUnread(): Promise<number>
}
