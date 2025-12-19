import { DynamicModule, Inject, Logger, Module, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { REDIS } from '@js-monorepo/nest/redis/redis'
import { RedisClientType } from 'redis'
import { BullMqProducerModuleOptions } from '../interfaces/bull-mq-module-options.interface'
import { BullMqProducerService } from './bull-mq-producer.service'
import { closeSharedBullMqConnection } from '../shared/utils/bullmq-connection-manager.util'

const MODULE_OPTIONS_TOKEN = Symbol('BULLMQ_PRODUCER_MODULE_OPTIONS')

const logger = new Logger('BullMqProducerModule')

@Module({})
export class BullMqProducerModule implements OnModuleDestroy {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: BullMqProducerModuleOptions,
    @Inject(REDIS) private readonly redisClient: RedisClientType
  ) {}

  static forRootAsync(options?: {
    useFactory: (...args: any[]) => Promise<BullMqProducerModuleOptions> | BullMqProducerModuleOptions
    inject?: any[]
  }): DynamicModule {
    return {
      module: BullMqProducerModule,
      imports: [],
      providers: [
        {
          provide: MODULE_OPTIONS_TOKEN,
          useFactory: options?.useFactory || (() => ({})),
          inject: options?.inject || [],
        },
        {
          provide: BullMqProducerService,
          useFactory: (
            moduleOptions: BullMqProducerModuleOptions,
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

            return new BullMqProducerService(
              finalOptions.sharedConnection!,
              finalOptions.queueNamePrefix,
              finalOptions.redisUrl
            )
          },
          inject: [MODULE_OPTIONS_TOKEN, REDIS, { token: ConfigService, optional: true }],
        },
      ],
      exports: [BullMqProducerService],
    }
  }

  async onModuleDestroy(): Promise<void> {
    logger.log('Closing BullMQ producer module...')
    // Note: We don't close shared connection here as consumer might still be using it
    // The consumer module will handle closing the shared connection
  }
}

