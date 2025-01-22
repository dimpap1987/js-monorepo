import { UnRegisteredUserCreateDto, UnRegisteredUserDto } from '@js-monorepo/types'

export interface UnregisteredService {
  createUnRegisteredUser(unRegisteredUser: UnRegisteredUserCreateDto): Promise<UnRegisteredUserDto>

  findUnRegisteredUserByToken(token: string): Promise<UnRegisteredUserDto>
}
