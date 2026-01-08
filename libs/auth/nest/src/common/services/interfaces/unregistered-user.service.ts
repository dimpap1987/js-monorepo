import { UnRegisteredUserCreateDto, UnRegisteredUserDto } from '@js-monorepo/types/auth'

export interface UnregisteredService {
  createUnRegisteredUser(unRegisteredUser: UnRegisteredUserCreateDto): Promise<UnRegisteredUserDto>

  findUnRegisteredUserByToken(token: string): Promise<UnRegisteredUserDto>
}
