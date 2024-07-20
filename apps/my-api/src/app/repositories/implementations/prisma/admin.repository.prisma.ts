import { PrismaService } from '@js-monorepo/db'
import {
  AuthUserDto,
  AuthUserFullDto,
  AuthUserUpdateDto,
  Pageable,
} from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { AdminRepository } from '../../interfaces/admin.repository'

@Injectable()
export class AdminRepositoryPrisma implements AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(
    pageable: Pageable
  ): Promise<{ users: AuthUserFullDto[]; totalCount: number }> {
    const { page, pageSize } = pageable

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
    updateUser: AuthUserUpdateDto
  ): Promise<AuthUserDto> {
    return this.prisma.authUser.update({
      where: { id: userId },
      data: {
        username: updateUser.username,
        roles: updateUser.roles,
      },
    })
  }
}
