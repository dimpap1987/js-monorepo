import { Global, Module, Provider } from '@nestjs/common'
import { AdminRepositoryPrisma } from '../repositories/implementations/prisma/admin.repository.prisma'
import { AdminService } from '../services/admin.service'

const providers: Provider[] = [
  {
    provide: 'ADMIN_REPOSITORY',
    useClass: AdminRepositoryPrisma,
  },
  AdminService,
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class AdminProviderModule {}
