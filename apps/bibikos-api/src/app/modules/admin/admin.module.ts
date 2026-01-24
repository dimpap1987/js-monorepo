import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { FeatureFlagsModule } from '@js-monorepo/feature-flags-server'
import { PaymentsModule } from '@js-monorepo/payments-server'
import { UserPresenceModule } from '@js-monorepo/user-presence'
import { Global, Module, Provider } from '@nestjs/common'
import { TagsModule } from '../tags'
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
]

@Global()
@Module({
  controllers: [AdminController],
  imports: [UserPresenceModule, PaymentsModule, FeatureFlagsModule, TagsModule],
  providers: [...providers, AuthSessionUserCacheService],
  exports: [...providers],
})
export class AdminProviderModule {}
