import { AuthRole, AuthRoleDTO } from '@js-monorepo/types/auth'

export interface RolesService {
  findRoleById(id: number): Promise<AuthRoleDTO>

  findRoleByName(name: string): Promise<AuthRoleDTO>

  getRolesByNames(roleNames: AuthRole[]): Promise<AuthRoleDTO[]>
}
