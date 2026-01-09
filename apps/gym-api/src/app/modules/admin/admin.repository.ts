import { AuthRoleDTO, AuthUserDto, AuthUserFullDto, AuthUserUpdateDto } from '@js-monorepo/types/auth'
import { Pageable, PaginationType } from '@js-monorepo/types/pagination'

export const AdminRepo = Symbol()

export interface AdminRepository {
  getUsers(pageable: Pageable): Promise<PaginationType<AuthUserFullDto>>

  getRoles(): Promise<AuthRoleDTO[]>

  updateUser(userId: number, updateUser: AuthUserUpdateDto): Promise<AuthUserDto>
}
