import { AuthRoleDTO, AuthUserDto, AuthUserFullDto } from '@js-monorepo/types/auth'
import { Pageable, PaginationType } from '@js-monorepo/types/pagination'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { BadRequestException, Injectable } from '@nestjs/common'
import { AdminRepository } from './admin.repository'
import { UpdateUserSchemaType } from '@js-monorepo/schemas'

@Injectable()
export class AdminRepositoryPrisma implements AdminRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  getRoles(): Promise<AuthRoleDTO[]> {
    return this.txHost.tx.role.findMany()
  }

  async getUsers(pageable: Pageable): Promise<PaginationType<AuthUserFullDto>> {
    const { page = 1, pageSize = 10 } = pageable

    const [totalCount, content] = await Promise.all([
      this.txHost.tx.authUser.count(),
      this.txHost.tx.authUser.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
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
      }),
    ])

    return {
      page,
      pageSize,
      content,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    }
  }

  async updateUser(userId: number, updateUser: UpdateUserSchemaType): Promise<AuthUserDto> {
    let roleOperations: { userRole?: any } | undefined = undefined

    if (updateUser.roles !== undefined) {
      const currentRoleIds = await this.getCurrentUserRoleIds(userId)
      const { rolesToAdd, rolesToRemove } = this.determineRoles(currentRoleIds, updateUser.roles)

      // Only include role ops if something actually changed
      if (rolesToAdd.length > 0 || rolesToRemove.length > 0) {
        roleOperations = {
          userRole: {
            ...(rolesToAdd.length > 0 && { create: this.createRoles(rolesToAdd) }),
            ...(rolesToRemove.length > 0 && { deleteMany: { roleId: { in: rolesToRemove } } }),
          },
        }
      }
    }

    return this.txHost.tx.authUser.update({
      where: { id: userId },
      data: {
        ...(updateUser.username && { username: updateUser.username }),
        ...roleOperations,
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
    return roles?.map((role) => role.id) || [2]
  }

  // Function to determine which roles to add and remove
  private determineRoles(currentRoleIds: number[], newRoleIds: number[]) {
    const rolesToAdd = newRoleIds.filter((id) => !currentRoleIds.includes(id))
    const rolesToRemove = currentRoleIds.filter((id) => !newRoleIds.includes(id))
    const finalRoleCount = currentRoleIds.length - rolesToRemove.length + rolesToAdd.length
    if (finalRoleCount <= 0) {
      throw new BadRequestException('User must have at least one role')
    }
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
