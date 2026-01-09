import { AuthUserCreateDto, AuthUserDto, ProvidersDto } from '@js-monorepo/types/auth'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@js-monorepo/db'
import { ConstraintCode, ConstraintViolationException } from '../../../exceptions/contraint-violation'
import { AuthRepository } from '../../auth.repository'

@Injectable()
export class AuthRepositoryPrismaImpl implements AuthRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findAuthUserByEmail(email: string): Promise<AuthUserDto> {
    return this.txHost.tx.authUser.findUniqueOrThrow({
      where: { email: email },
      select: this.authUserSelectStatement(),
    })
  }

  async findAuthUserById(id: number): Promise<AuthUserDto> {
    return this.txHost.tx.authUser.findUniqueOrThrow({
      where: { id: id },
      select: this.authUserSelectStatement(),
    })
  }

  async createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto,
    roleIds: number[]
  ): Promise<AuthUserDto> {
    return this.txHost.tx.authUser
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
      .catch((e: unknown) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new ConstraintViolationException(ConstraintCode.USERNAME_EXISTS)
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
