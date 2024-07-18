import {
  AuthUserCreateDto,
  AuthUserDto,
  AuthUserWithProvidersDto,
  ProvidersDto,
} from '@js-monorepo/types'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { AuthRepository } from '../../auth.repository'

@Injectable()
export class AuthRepositoryPrismaImpl implements AuthRepository {
  private readonly logger = new Logger(AuthRepositoryPrismaImpl.name)

  constructor(@Inject('DB_CLIENT') private readonly dbClient: PrismaClient) {}

  async findAuthUserByEmail(email: string): Promise<AuthUserWithProvidersDto> {
    return this.dbClient.authUser.findUniqueOrThrow({
      where: { email: email },
      include: {
        providers: true,
      },
    })
  }

  async findAuthUserById(id: number): Promise<AuthUserWithProvidersDto> {
    return this.dbClient.authUser.findUniqueOrThrow({
      where: { id: id },
      include: {
        providers: true,
      },
    })
  }

  async createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto
  ): Promise<AuthUserDto> {
    return this.dbClient.authUser.create({
      data: {
        email: authUserDTO.email,
        username: authUserDTO.username,
        providers: {
          create: {
            type: providerDTO.type,
            profileImage: providerDTO.profileImage,
          },
        },
      },
    })
  }
}
