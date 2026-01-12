import {
  AuthRole,
  AuthUserCreateDto,
  AuthUserDto,
  ProviderName,
  ProvidersDto,
  SessionUserType,
} from '@js-monorepo/types/auth'

export interface ProfileExtras {
  firstName?: string | null
  lastName?: string | null
  accessToken?: string
  refreshToken?: string
  scopes?: string[]
}

export interface AuthService {
  findAuthUserByEmail(email: string): Promise<AuthUserDto | null>

  findAuthUserById(id: number): Promise<AuthUserDto | null>

  findAuthUserByUsername(username: string): Promise<AuthUserDto | null>

  createAuthUser(authUserDTO: AuthUserCreateDto, providerDTO: ProvidersDto, roles?: AuthRole[]): Promise<AuthUserDto>

  createAuthUserByProviderName(
    authUserDTO: AuthUserCreateDto,
    providerName: ProviderName,
    profileImage?: string | null,
    roles?: AuthRole[],
    profileExtras?: ProfileExtras
  ): Promise<AuthUserDto>

  createSessionUser(authUser: Partial<AuthUserDto>): SessionUserType
}
