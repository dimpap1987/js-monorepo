import { PrismaService } from '@js-monorepo/db'
import { AuthUserUpdateDto, Pageable } from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { AdminRepository } from '../../interfaces/admin.repository'

@Injectable()
export class AdminRepositoryPrisma implements AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(
    pageable: Pageable
  ): Promise<{ users: any[]; totalCount: number }> {
    const { page, pageSize } = pageable

    if (!page && !pageSize) {
      // If page or pageSize is not provided, fetch all users without pagination
      const allUsers = await this.prisma.authUser.findMany({
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
      return {
        users: allUsers,
        totalCount: allUsers?.length,
      }
    }

    const totalCount = await this.prisma.authUser.count()
    // Fetch users with pagination using Prisma
    const users = await this.prisma.authUser.findMany({
      take: pageSize,
      skip: page * pageSize,
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
    return {
      users: users,
      totalCount: totalCount,
    }
  }

  async updateUser(
    userId: number,
    updateUser: AuthUserUpdateDto
  ): Promise<any> {
    return this.prisma.authUser.update({
      where: { id: userId },
      data: {
        username: updateUser.username,
        // roles: updateUser.roles,
      },
    })
  }
}
