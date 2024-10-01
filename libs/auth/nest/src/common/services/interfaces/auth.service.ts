import {
  AuthUserCreateDto,
  AuthUserDto,
  ProvidersDto,
} from '@js-monorepo/types'

export interface AuthService {
  findAuthUserByEmail(email: string): Promise<AuthUserDto | null>

  findAuthUserById(id: number): Promise<AuthUserDto | null>

  createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto
  ): Promise<AuthUserDto>
}
