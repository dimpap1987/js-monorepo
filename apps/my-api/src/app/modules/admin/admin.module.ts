import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { UserPresenceModule } from '@js-monorepo/user-presence'
import { Global, Module, Provider } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminRepo } from './admin.repository'
import { AdminRepositoryPrisma } from './admin.repository.prisma'
import { AdminService } from './admin.service'

const providers: Provider[] = [
  {
    provide: AdminRepo,
    useClass: AdminRepositoryPrisma,
  },
  AdminService,
]

@Global()
@Module({
  controllers: [AdminController],
  imports: [UserPresenceModule],
  providers: [...providers, AuthSessionUserCacheService],
  exports: [...providers],
})
export class AdminProviderModule {}
