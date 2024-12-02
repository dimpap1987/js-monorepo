import { Global, Module, Provider } from '@nestjs/common'
import { NotificationController } from './notification.controller'
import { NotificationRepo } from './notification.repository'
import { NotificationRepositoryPrisma } from './notification.repository.prisma'
import { NotificationService } from './notification.service'
import { UserPresenceModule } from '@js-monorepo/user-presence'

const providers: Provider[] = [
  {
    provide: NotificationRepo,
    useClass: NotificationRepositoryPrisma,
  },
  NotificationService,
]

@Global()
@Module({
  imports: [UserPresenceModule],
  controllers: [NotificationController],
  providers: [...providers],
  exports: [...providers],
})
export class NotificationServerModule {}
