import {
  AuthUserCreateDto,
  AuthUserDto,
  AuthUserWithProvidersDto,
  ProvidersDto,
} from '@js-monorepo/types'

export interface AuthRepository {
  findAuthUserByEmail(email: string): Promise<AuthUserWithProvidersDto>

  findAuthUserById(id: number): Promise<AuthUserWithProvidersDto>

  createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto
  ): Promise<AuthUserDto>
}
