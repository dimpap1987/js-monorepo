import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { FeatureFlagsService } from '@js-monorepo/feature-flags-server'
import { PaymentsModule } from '@js-monorepo/payments-server'
import { UserPresenceModule } from '@js-monorepo/user-presence'
import { Global, Module, Provider } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminPaymentsService } from './admin-payments.service'
import { AdminRepo } from './admin.repository'
import { AdminRepositoryPrisma } from './admin.repository.prisma'
import { AdminService } from './admin.service'

const providers: Provider[] = [
  {
    provide: AdminRepo,
    useClass: AdminRepositoryPrisma,
  },
  AdminService,
  AdminPaymentsService,
  FeatureFlagsService,
]

@Global()
@Module({
  controllers: [AdminController],
  imports: [UserPresenceModule, PaymentsModule],
  providers: [...providers, AuthSessionUserCacheService],
  exports: [...providers],
})
export class AdminProviderModule {}
