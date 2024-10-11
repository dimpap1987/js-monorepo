import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { UserPresenceModule } from '@js-monorepo/user-presence'
import { Global, Module, Provider } from '@nestjs/common'
import { AdminRepositoryPrisma } from '../repositories/implementations/prisma/admin.repository.prisma'
import { AdminService } from '../services/admin.service'
import { AdminRepo } from '../types'

const providers: Provider[] = [
  {
    provide: AdminRepo,
    useClass: AdminRepositoryPrisma,
  },
  AdminService,
  AuthSessionUserCacheService,
]

@Global()
@Module({
  imports: [UserPresenceModule],
  providers: [...providers],
  exports: [...providers],
})
export class AdminProviderModule {}
