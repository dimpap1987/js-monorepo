import { UnRegisteredUserCreateDto, UnRegisteredUserDto } from '@js-monorepo/types/auth'

export interface UnregisteredRepository {
  createUnRegisteredUser(unRegisteredUser: UnRegisteredUserCreateDto): Promise<UnRegisteredUserDto>

  findUnRegisteredUserByToken(token: string): Promise<UnRegisteredUserDto>
}
