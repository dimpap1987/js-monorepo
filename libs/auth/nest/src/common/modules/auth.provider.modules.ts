import { Global, Module, Provider } from '@nestjs/common'
import { AuthRepositoryPrismaImpl } from '../repositories/implementations/prisma/auth.repository'
import { AuthServiceImpl } from '../services/implementations/auth.service'
import { RepoAuth, ServiceAuth } from '../types'

const providers: Provider[] = [
  {
    provide: RepoAuth,
    useClass: AuthRepositoryPrismaImpl,
  },
  {
    provide: ServiceAuth,
    useClass: AuthServiceImpl,
  },
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class AuthProviderModule {}
