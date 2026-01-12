import { AuthUserCreateDto, AuthUserDto, ProviderName, ProvidersDto } from '@js-monorepo/types/auth'

export interface AuthRepository {
  findAuthUserByEmail(email: string): Promise<AuthUserDto>

  findAuthUserById(id: number): Promise<AuthUserDto>

  findAuthUserByUsername(username: string): Promise<AuthUserDto | null>

  findProviderByName(providerName: ProviderName): Promise<{ id: number; name: string }>

  createAuthUser(authUserDTO: AuthUserCreateDto, providerDTO: ProvidersDto, roleIds: number[]): Promise<AuthUserDto>
}
