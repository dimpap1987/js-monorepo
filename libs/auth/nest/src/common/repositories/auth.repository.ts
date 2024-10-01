import {
  AuthUserCreateDto,
  AuthUserDto,
  ProvidersDto,
} from '@js-monorepo/types'

export interface AuthRepository {
  findAuthUserByEmail(email: string): Promise<AuthUserDto>

  findAuthUserById(id: number): Promise<AuthUserDto>

  createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto
  ): Promise<AuthUserDto>
}
