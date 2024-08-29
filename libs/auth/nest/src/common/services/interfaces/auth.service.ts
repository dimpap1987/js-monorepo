import {
  AuthUserCreateDto,
  AuthUserDto,
  AuthUserWithProvidersDto,
  ProvidersDto,
} from '@js-monorepo/types'

export interface AuthService {
  findAuthUserByEmail(email: string): Promise<AuthUserWithProvidersDto | null>

  findAuthUserById(id: number): Promise<AuthUserWithProvidersDto | null>

  createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto
  ): Promise<AuthUserDto>
}
