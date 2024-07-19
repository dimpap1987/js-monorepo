import { Global, Module, Provider } from '@nestjs/common'
import { NotificationRepositoryPrisma } from '../repositories/implementations/prisma/notification.repository.prisma'
import { NotificationService } from '../services/notification.service'

const providers: Provider[] = [
  {
    provide: 'NOTIFICATION_REPOSITORY',
    useClass: NotificationRepositoryPrisma,
  },
  NotificationService,
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class NotificationProviderModule {}
