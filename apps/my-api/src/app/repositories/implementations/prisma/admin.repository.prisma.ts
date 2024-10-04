import { AuthUserUpdateDto, Pageable } from '@js-monorepo/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { AdminRepository } from '../../interfaces/admin.repository'

@Injectable()
export class AdminRepositoryPrisma implements AdminRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>
  ) {}

  async getUsers(
    pageable: Pageable
  ): Promise<{ users: any[]; totalCount: number }> {
    const { page, pageSize } = pageable

    if (!page && !pageSize) {
      // If page or pageSize is not provided, fetch all users without pagination
      const allUsers = await this.txHost.tx.authUser.findMany({
        select: {
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
        },
      })
      return {
        users: allUsers,
        totalCount: allUsers?.length,
      }
    }

    const totalCount = await this.txHost.tx.authUser.count()
    // Fetch users with pagination using txHost.tx
    const users = await this.txHost.tx.authUser.findMany({
      take: pageSize,
      skip: page * pageSize,
      select: {
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
      },
    })
    return {
      users: users,
      totalCount: totalCount,
    }
  }

  async updateUser(
    userId: number,
    updateUser: AuthUserUpdateDto
  ): Promise<any> {
    return this.txHost.tx.authUser.update({
      where: { id: userId },
      data: {
        username: updateUser.username,
        // roles: updateUser.roles,
      },
    })
  }
}
