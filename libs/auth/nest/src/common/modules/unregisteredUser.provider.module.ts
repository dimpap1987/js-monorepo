import { Global, Module, Provider } from '@nestjs/common'
import { UnRegisteredUserRepositoryPrismaImpl } from '../repositories/implementations/prisma/unregistered.repository'
import { UnregisteredServiceImpl } from '../services/implementations/unregistered-user.service'
import { RepoUnRegisteredUser, ServiceUnRegisteredUser } from '../types'

const providers: Provider[] = [
  {
    provide: RepoUnRegisteredUser,
    useClass: UnRegisteredUserRepositoryPrismaImpl,
  },
  {
    provide: ServiceUnRegisteredUser,
    useClass: UnregisteredServiceImpl,
  },
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class UnRegisteredUserProviderModule {}
