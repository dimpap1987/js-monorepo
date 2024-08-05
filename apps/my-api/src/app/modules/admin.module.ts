import { Global, Module, Provider } from '@nestjs/common'
import { AdminRepo } from '../types'
import { AdminRepositoryPrisma } from '../repositories/implementations/prisma/admin.repository.prisma'
import { AdminService } from '../services/admin.service'

const providers: Provider[] = [
  {
    provide: AdminRepo,
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
