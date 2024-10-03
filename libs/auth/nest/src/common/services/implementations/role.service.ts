import { AuthRole, AuthRoleDTO } from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { RolesRepository } from '../../repositories/implementations/prisma/role.repository'
import { RolesService } from '../interfaces/roles.service'

@Injectable()
export class RolesServiceImpl implements RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async findRoleById(id: number): Promise<AuthRoleDTO> {
    const role = await this.rolesRepository.findRoleById(id)
    return {
      id: role.id,
      name: role.name as AuthRole,
    }
  }

  async findRoleByName(name: string): Promise<AuthRoleDTO> {
    const role = await this.rolesRepository.findRoleByName(name)
    return {
      id: role.id,
      name: role.name as AuthRole,
    }
  }

  async getRolesByNames(roleNames: AuthRole[]): Promise<AuthRoleDTO[]> {
    return this.rolesRepository.getRolesByNames(roleNames)
  }
}
