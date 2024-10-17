import {
  AuthRoleDTO,
  AuthUserDto,
  AuthUserUpdateDto,
  Pageable,
} from '@js-monorepo/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { AdminRepository } from './admin.repository'

@Injectable()
export class AdminRepositoryPrisma implements AdminRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>
  ) {}

  getRoles(): Promise<AuthRoleDTO[]> {
    return this.txHost.tx.role.findMany()
  }

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
  ): Promise<AuthUserDto> {
    const currentRoleIds = await this.getCurrentUserRoleIds(userId)
    const newRoleIds = this.getNewRoleIds(updateUser.roles)

    const { rolesToAdd, rolesToRemove } = this.determineRoles(
      currentRoleIds,
      newRoleIds
    )

    return this.txHost.tx.authUser.update({
      where: { id: userId },
      data: {
        username: updateUser.username,
        userRole: {
          create: this.createRoles(rolesToAdd),
          deleteMany: this.deleteRoles(rolesToRemove),
        },
      },
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
  }

  // Function to get current role IDs for a user
  private async getCurrentUserRoleIds(userId: number): Promise<number[]> {
    const currentUserRoles = await this.txHost.tx.authUser.findUnique({
      where: { id: userId },
      include: { userRole: true }, // Include the userRole relation
    })

    return currentUserRoles?.userRole.map((role) => role.roleId) || []
  }

  // Function to extract new role IDs or default to 'USER'
  private getNewRoleIds(roles?: { id: number }[]): number[] {
    return roles?.map((role) => role.id) || [1]
  }

  // Function to determine which roles to add and remove
  private determineRoles(currentRoleIds: number[], newRoleIds: number[]) {
    const rolesToAdd = newRoleIds.filter(
      (roleId) => !currentRoleIds.includes(roleId)
    )
    const rolesToRemove = currentRoleIds.filter(
      (roleId) => !newRoleIds.includes(roleId)
    )

    return { rolesToAdd, rolesToRemove }
  }

  private createRoles(rolesToAdd: number[]) {
    return rolesToAdd.map((roleId) => ({
      roleId,
    }))
  }

  private deleteRoles(rolesToRemove: number[]) {
    return rolesToRemove.map((roleId) => ({
      roleId,
    }))
  }
}
