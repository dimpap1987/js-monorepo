import { UpdateUserSchemaType } from '@js-monorepo/schemas'
import { AuthRoleDTO, AuthUserDto, AuthUserFullDto } from '@js-monorepo/types/auth'
import { Pageable, PaginationType } from '@js-monorepo/types/pagination'

export const AdminRepo = Symbol()

// Organizer types for admin management
export interface AdminOrganizerDto {
  id: number
  displayName: string | null
  slug: string | null
  bio: string | null
  createdAt: Date
  profileImage: string | null
  badges: Array<{
    id: number
    name: string
    category: string | null
  }>
  selfSelectedTags: Array<{
    id: number
    name: string
    category: string | null
  }>
}

export interface AdminRepository {
  getUsers(pageable: Pageable): Promise<PaginationType<AuthUserFullDto>>

  getRoles(): Promise<AuthRoleDTO[]>

  updateUser(userId: number, updateUser: UpdateUserSchemaType): Promise<AuthUserDto>

  banUser(userId: number): Promise<AuthUserDto>

  unbanUser(userId: number): Promise<AuthUserDto>

  deactivateUser(userId: number): Promise<AuthUserDto>

  // Organizer badge management
  getOrganizers(pageable: Pageable): Promise<PaginationType<AdminOrganizerDto>>

  assignBadgeToOrganizer(organizerId: number, tagId: number): Promise<void>

  removeBadgeFromOrganizer(organizerId: number, tagId: number): Promise<void>
}
