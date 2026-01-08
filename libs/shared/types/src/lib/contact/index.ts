// Contact Message Types
export const CONTACT_CATEGORIES = ['general', 'support', 'feedback', 'bug', 'other'] as const
export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]

export const CONTACT_STATUSES = ['unread', 'read', 'archived'] as const
export type ContactStatus = (typeof CONTACT_STATUSES)[number]

export interface ContactMessageCreateDto {
  email: string
  message: string
  category?: ContactCategory
}

export interface ContactMessageDto {
  id: number
  email: string
  message: string
  category: ContactCategory
  status: ContactStatus
  userId?: number | null
  createdAt: Date
  updatedAt: Date
  user?: {
    id: number
    username: string
  } | null
}

export interface ContactMessageUpdateStatusDto {
  status: ContactStatus
}
