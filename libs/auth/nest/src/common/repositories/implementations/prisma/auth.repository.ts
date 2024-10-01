import { PrismaService } from '@js-monorepo/db'
import {
  AuthUserCreateDto,
  AuthUserDto,
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

  async findAuthUserByEmail(email: string): Promise<AuthUserDto> {
    return this.dbClient.authUser.findUniqueOrThrow({
      where: { email: email },
      select: {
        id: true,
        createdAt: true,
        username: true,
        email: true,
        userProfiles: true,
        userRole: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })
  }

  async findAuthUserById(id: number): Promise<AuthUserDto> {
    return this.dbClient.authUser.findUniqueOrThrow({
      where: { id: id },
      select: {
        id: true,
        createdAt: true,
        username: true,
        email: true,
        userProfiles: true,
        userRole: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
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
          userProfiles: {
            create: {
              providerId: providerDTO.id,
              profileImage: providerDTO.profileImage,
            },
          },
          userRole: {
            create: {
              roleId: 2,
            },
          },
        },
        select: {
          id: true,
          createdAt: true,
          username: true,
          email: true,
          userProfiles: true,
          userRole: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
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
