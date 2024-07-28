import { Global, Module, Provider } from '@nestjs/common'
import { NotificationRepo } from '../types'
import { NotificationRepositoryPrisma } from '../repositories/implementations/prisma/notification.repository.prisma'
import { NotificationService } from '../services/notification.service'

const providers: Provider[] = [
  {
    provide: NotificationRepo,
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
