import { Global, Module, Provider } from '@nestjs/common'
import { UnRegisteredUserRepositoryPrismaImpl } from '../repositories/implementations/prisma/unregistered.repository'
import { UnregisteredServiceImpl } from '../services/implementations/unregistered-user.service'

const providers: Provider[] = [
  {
    provide: 'UNREGISTERED_USER_REPOSITORY',
    useClass: UnRegisteredUserRepositoryPrismaImpl,
  },
  {
    provide: 'UNREGISTERED_USER_SERVICE',
    useClass: UnregisteredServiceImpl,
  },
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class UnRegisteredUserProviderModule {}
