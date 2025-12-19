import { DynamicModule, Inject, Logger, Module, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { REDIS } from '@js-monorepo/nest/redis/redis'
import { RedisClientType } from 'redis'
import { BullMqConsumerModuleOptions } from '../interfaces/bull-mq-module-options.interface'
import { BullMqConsumerService } from './bull-mq-consumer.service'
import { closeSharedBullMqConnection } from '../shared/utils/bullmq-connection-manager.util'

const MODULE_OPTIONS_TOKEN = Symbol('BULLMQ_CONSUMER_MODULE_OPTIONS')

const logger = new Logger('BullMqConsumerModule')

@Module({})
export class BullMqConsumerModule implements OnModuleDestroy {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: BullMqConsumerModuleOptions,
    @Inject(REDIS) private readonly redisClient: RedisClientType
  ) {}

  static forRootAsync(options?: {
    useFactory: (...args: any[]) => Promise<BullMqConsumerModuleOptions> | BullMqConsumerModuleOptions
    inject?: any[]
  }): DynamicModule {
    return {
      module: BullMqConsumerModule,
      imports: [],
      providers: [
        {
          provide: MODULE_OPTIONS_TOKEN,
          useFactory: options?.useFactory || (() => ({})),
          inject: options?.inject || [],
        },
        {
          provide: BullMqConsumerService,
          useFactory: (
            moduleOptions: BullMqConsumerModuleOptions,
            redisClient: RedisClientType,
            configService?: ConfigService
          ) => {
            const finalOptions = {
              queueNamePrefix: 'bullmq',
              ...moduleOptions,
              sharedConnection: redisClient,
              // Try to get Redis URL from ConfigService if not provided
              redisUrl: moduleOptions.redisUrl || configService?.get<string>('REDIS_URL'),
            }

            logger.log(
              `♻️  Using shared Redis connection from RedisModule with prefix: '${finalOptions.queueNamePrefix}'`
            )

            return new BullMqConsumerService(
              finalOptions.sharedConnection!,
              finalOptions.queueNamePrefix,
              finalOptions.redisUrl
            )
          },
          inject: [MODULE_OPTIONS_TOKEN, REDIS, { token: ConfigService, optional: true }],
        },
      ],
      exports: [BullMqConsumerService],
    }
  }

  async onModuleDestroy(): Promise<void> {
    logger.log('Closing BullMQ consumer module...')
    await closeSharedBullMqConnection()
    logger.log('✅ Shared BullMQ connection closed')
  }
}
