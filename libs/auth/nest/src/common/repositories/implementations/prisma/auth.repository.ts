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
      select: this.authUserSelectStatement(),
    })
  }

  async findAuthUserById(id: number): Promise<AuthUserDto> {
    return this.dbClient.authUser.findUniqueOrThrow({
      where: { id: id },
      select: this.authUserSelectStatement(),
    })
  }

  async createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto,
    roleIds: number[]
  ): Promise<AuthUserDto> {
    return this.dbClient.authUser
      .create({
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
            create: roleIds.map((roleId) => ({
              role: {
                connect: {
                  id: roleId,
                },
              },
            })),
          },
        },
        select: this.authUserSelectStatement(),
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new ConstraintViolationException(
              ConstraintCode.USERNAME_EXISTS
            )
          }
        }
        throw e // Re-throw any other errors
      })
  }

  private authUserSelectStatement() {
    return {
      id: true,
      createdAt: true,
      username: true,
      email: true,
      userProfiles: {
        select: {
          id: true,
          providerId: true,
          profileImage: true,
          provider: {
            select: {
              name: true,
            },
          },
        },
      },
      userRole: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    }
  }
}
