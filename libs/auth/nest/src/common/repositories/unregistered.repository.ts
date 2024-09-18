import {
  UnRegisteredUserCreateDto,
  UnRegisteredUserDto,
} from '@js-monorepo/types'

export interface UnregisteredRepository {
  createUnRegisteredUser(
    unRegisteredUser: UnRegisteredUserCreateDto
  ): Promise<UnRegisteredUserDto>

  findUnRegisteredUserByToken(token: string): Promise<UnRegisteredUserDto>
}
