import { AuthRole } from '@js-monorepo/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'

@Injectable()
export class RolesRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>
  ) {}

  async findRoleById(id: number) {
    return this.txHost.tx.role.findUniqueOrThrow({
      where: { id },
    })
  }

  async findRoleByName(name: string) {
    return this.txHost.tx.role.findUniqueOrThrow({
      where: { name },
    })
  }

  async getRolesByNames(roleNames: AuthRole[]) {
    return this.txHost.tx.role.findMany({
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
