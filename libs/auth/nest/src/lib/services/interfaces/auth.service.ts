import {
  AuthUserCreateDto,
  AuthUserDto,
  AuthUserWithProvidersDto,
  ProvidersDto,
} from '@js-monorepo/types'

export interface AuthService {
  findAuthUserByEmail(email: string): Promise<AuthUserWithProvidersDto>

  findAuthUserById(id: number): Promise<AuthUserWithProvidersDto>

  createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto
  ): Promise<AuthUserDto>
}
