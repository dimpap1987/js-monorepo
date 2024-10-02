import {
  AuthUserCreateDto,
  AuthUserDto,
  ProvidersDto,
  SessionUserType,
} from '@js-monorepo/types'
import { AuthUser } from '@prisma/client'

export interface AuthService {
  findAuthUserByEmail(email: string): Promise<AuthUserDto | null>

  findAuthUserById(id: number): Promise<AuthUserDto | null>

  createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto
  ): Promise<AuthUserDto>

  createSessionUser(authUser: Partial<AuthUser>): SessionUserType
}
