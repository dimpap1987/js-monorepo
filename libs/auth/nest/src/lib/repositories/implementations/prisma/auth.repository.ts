import { PrismaService } from '@js-monorepo/db'
import {
  AuthUserCreateDto,
  AuthUserDto,
  AuthUserWithProvidersDto,
  ProvidersDto,
} from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import {
  ConstraintCode,
  ConstraintViolationException,
} from '../../../exceptions/contraint-violation'
import { AuthRepository } from '../../auth.repository'

@Injectable()
export class AuthRepositoryPrismaImpl implements AuthRepository {
  constructor(private readonly dbClient: PrismaService) {}

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
    try {
      const user = await this.dbClient.authUser.create({
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
      return user
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConstraintViolationException(ConstraintCode.USERNAME_EXISTS)
        }
      }
      throw e
    }
  }
}
