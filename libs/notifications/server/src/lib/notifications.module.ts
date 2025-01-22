import { CreateUserNotificationType } from '@js-monorepo/types'
import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { NotificationController } from './notification.controller'
import { NotificationRepo } from './notification.repository'
import { NotificationRepositoryPrisma } from './notification.repository.prisma'
import { NotificationService } from './notification.service'

export interface NotificationModuleOptions {
  onNotificationCreation?: (receiverIds: number[], notification: CreateUserNotificationType) => void
}

const providers: Provider[] = [
  {
    provide: NotificationRepo,
    useClass: NotificationRepositoryPrisma,
  },
  NotificationService,
]

@Global()
@Module({
  controllers: [NotificationController],
  providers: [...providers],
  exports: [...providers],
})
@Global()
export class NotificationServerModule {
  static forRootAsync(options: {
    useFactory?: (...args: any[]) => NotificationModuleOptions | Promise<NotificationModuleOptions>
    inject?: any[]
    imports?: any[]
  }): DynamicModule {
    return {
      global: true,
      module: NotificationServerModule,
      imports: [...(options.imports || [])],
      providers: [
        {
          provide: 'NOTIFICATION_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        ...providers,
      ],
      controllers: [NotificationController],
      exports: [...providers, 'NOTIFICATION_OPTIONS'],
    }
  }
}
