import { AuthRole, AuthRoleDTO } from '@js-monorepo/types'

export interface RolesService {
  findRoleById(id: number): Promise<AuthRoleDTO>

  findRoleByName(name: string): Promise<AuthRoleDTO>

  getRolesByNames(roleNames: AuthRole[]): Promise<AuthRoleDTO[]>
}
