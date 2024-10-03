import { PrismaService } from '@js-monorepo/db'
import { AuthRole, AuthRoleDTO } from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthException } from '../../exceptions/api-exception'
import { RolesService } from '../interfaces/roles.service'

@Injectable()
export class RolesServiceImpl implements RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findRoleById(id: number): Promise<AuthRoleDTO> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    })

    if (!role) {
      throw new AuthException(404, `Role with ID ${id} not found`)
    }

    return this.mapToAuthRoleDTO(role)
  }

  async findRoleByName(name: string): Promise<AuthRoleDTO> {
    const role = await this.prisma.role.findUnique({
      where: { name },
    })

    if (!role) {
      throw new AuthException(404, `Role with name ${name} not found`)
    }

    return this.mapToAuthRoleDTO(role)
  }

  // Helper method to map Role to AuthRoleDTO
  private mapToAuthRoleDTO(role: Role): AuthRoleDTO {
    return {
      id: role.id,
      name: role.name as AuthRole,
    }
  }

  async getRolesByNames(roleNames: AuthRole[]): Promise<AuthRoleDTO[]> {
    return this.prisma.role.findMany({
      where: {
        name: {
          in: roleNames,
        },
      },
      select: {
        id: true,
        name: true,
      },
    })
  }
}
