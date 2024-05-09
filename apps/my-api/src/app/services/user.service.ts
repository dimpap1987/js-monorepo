import { Injectable } from '@nestjs/common'
import { AuthUser } from '@prisma/client'
import { PrismaService } from './prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(page?: number, pageSize?: number): Promise<AuthUser[]> {
    if (!page && !pageSize) {
      // If page or pageSize is not provided, fetch all users without pagination
      return this.prisma.authUser.findMany()
    }

    // Fetch users with pagination using Prisma
    return this.prisma.authUser.findMany({
      take: pageSize,
      skip: page * pageSize,
    })
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
