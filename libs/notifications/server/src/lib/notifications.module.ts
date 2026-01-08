import { RedisPushSubscriptionsKey } from '@js-monorepo/auth/nest/common/types'
import { CreateUserNotificationType } from '@js-monorepo/types/notifications'
import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NotificationController } from './notification.controller'
import { NotificationRepo } from './notification.repository'
import { NotificationRepositoryPrisma } from './notification.repository.prisma'
import { NotificationService } from './notification.service'

export interface NotificationModuleOptions {
  onNotificationCreation?: (receiverIds: number[], notification: CreateUserNotificationType) => void
  adminEmail: string
  vapidPublicKey: string
  vapidPrivateKey: string
}

const providers: Provider[] = [
  {
    provide: NotificationRepo,
    useClass: NotificationRepositoryPrisma,
  },
  NotificationService,
  {
    provide: RedisPushSubscriptionsKey,
    useFactory: (configService: ConfigService) => {
      return configService.get<string>('REDIS_NAMESPACE')
        ? `${configService.get<string>('REDIS_NAMESPACE')}:push_subscription:user:`
        : 'push_subscription:user:'
    },
    inject: [ConfigService],
  },
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
          inject: [...(options.inject ?? []), ConfigService],
        },
        ...providers,
      ],
      controllers: [NotificationController],
      exports: [...providers, 'NOTIFICATION_OPTIONS'],
    }
  }
}
