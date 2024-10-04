import { Global, Module, Provider } from '@nestjs/common'
import { AuthRepositoryPrismaImpl } from '../repositories/implementations/prisma/auth.repository'
import { AuthServiceImpl } from '../services/implementations/auth.service'
import { RolesServiceImpl } from '../services/implementations/role.service'
import { RepoAuth, ServiceAuth, ServiceRole } from '../types'
import { RolesRepository } from '../repositories/implementations/prisma/role.repository'

const providers: Provider[] = [
  {
    provide: RepoAuth,
    useClass: AuthRepositoryPrismaImpl,
  },
  {
    provide: ServiceAuth,
    useClass: AuthServiceImpl,
  },
  {
    provide: ServiceRole,
    useClass: RolesServiceImpl,
  },
  RolesRepository,
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class AuthProviderModule {}
