import { PrismaService } from '@js-monorepo/db'
import { AuthUserFullPayload } from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { AuthUser } from '@prisma/client'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(
    page?: number,
    pageSize?: number
  ): Promise<{
    users: AuthUserFullPayload[]
    totalCount: number
  }> {
    // Fetch total count of users
    if (!page && !pageSize) {
      // If page or pageSize is not provided, fetch all users without pagination
      const allUsers = await this.prisma.authUser.findMany({
        include: {
          providers: true,
          receivedNotifications: true,
          sentNotifications: true,
          userChannels: true,
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
      include: {
        providers: true,
        receivedNotifications: true,
        sentNotifications: true,
        userChannels: true,
      },
    })
    return {
      users: users,
      totalCount: totalCount,
    }
  }

  async updateUser(
    userId: number,
    updateUser: Omit<AuthUser, 'id' | 'email' | 'createdAt'>
  ): Promise<AuthUser> {
    return this.prisma.authUser.update({
      where: { id: userId },
      data: {
        username: updateUser.username,
        roles: updateUser.roles,
      },
    })
  }
}
