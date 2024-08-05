import {
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

  updateUser(
    userId: number,
    updateUser: AuthUserUpdateDto
  ): Promise<AuthUserDto>
}
