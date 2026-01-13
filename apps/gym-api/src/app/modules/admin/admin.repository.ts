import { UpdateUserSchemaType } from '@js-monorepo/schemas'
import { AuthRoleDTO, AuthUserDto, AuthUserFullDto } from '@js-monorepo/types/auth'
import { Pageable, PaginationType } from '@js-monorepo/types/pagination'

export const AdminRepo = Symbol()

export interface AdminRepository {
  getUsers(pageable: Pageable): Promise<PaginationType<AuthUserFullDto>>

  getRoles(): Promise<AuthRoleDTO[]>

  updateUser(userId: number, updateUser: UpdateUserSchemaType): Promise<AuthUserDto>
}
