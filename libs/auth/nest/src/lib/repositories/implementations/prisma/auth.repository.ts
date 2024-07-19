import {
  AuthUserCreateDto,
  AuthUserDto,
  AuthUserWithProvidersDto,
  ProvidersDto,
} from '@js-monorepo/types'
import { Inject, Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import {
  CONSTRAINT_CODE,
  ConstraintViolationException,
} from '../../../exceptions/contraint-violation'
import { AuthRepository } from '../../auth.repository'

@Injectable()
export class AuthRepositoryPrismaImpl implements AuthRepository {
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
    try {
      return await this.dbClient.authUser.create({
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
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConstraintViolationException(
            CONSTRAINT_CODE.USERNAME_EXISTS
          )
        }
      }
      throw e
    }
  }
}
