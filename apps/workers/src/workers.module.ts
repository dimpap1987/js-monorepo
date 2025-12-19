import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RedisModule } from '@js-monorepo/nest/redis/redis'
import { BullMqConsumerModule } from '@js-monorepo/bull-mq-transport'
import { EmailProcessor } from './processors/email.processor'
import { OrderProcessor } from './processors/order.processor'
import { HealthController } from './controllers/health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        url: configService.get('REDIS_URL') || 'redis://localhost:6379',
      }),
      isGlobal: true,
    }),
    BullMqConsumerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        queueNamePrefix: configService.get('BULLMQ_QUEUE_PREFIX') || 'workers',
        redisUrl: configService.get('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [HealthController],
  providers: [EmailProcessor, OrderProcessor],
})
export class WorkersModule {}
