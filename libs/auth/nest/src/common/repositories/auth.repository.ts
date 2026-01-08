import { AuthUserCreateDto, AuthUserDto, ProvidersDto } from '@js-monorepo/types/auth'

export interface AuthRepository {
  findAuthUserByEmail(email: string): Promise<AuthUserDto>

  findAuthUserById(id: number): Promise<AuthUserDto>

  createAuthUser(authUserDTO: AuthUserCreateDto, providerDTO: ProvidersDto, roleIds: number[]): Promise<AuthUserDto>
}
