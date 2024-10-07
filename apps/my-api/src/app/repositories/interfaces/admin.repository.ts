import {
  AuthRoleDTO,
  AuthUserDto,
  AuthUserFullDto,
  AuthUserUpdateDto,
  Pageable,
} from '@js-monorepo/types'

export interface AdminRepository {
  getUsers(pageable: Pageable): Promise<{
    users: AuthUserFullDto[]
    totalCount: number
  }>

  getRoles(): Promise<AuthRoleDTO[]>

  updateUser(
    userId: number,
    updateUser: AuthUserUpdateDto
  ): Promise<AuthUserDto>
}
