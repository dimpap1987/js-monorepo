import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IDEMPOTENCY_CONFIG, IdempotencyInterceptor } from './idempotency.interceptor'

@Global()
@Module({
  providers: [
    {
      provide: IDEMPOTENCY_CONFIG,
      useFactory: (configService: ConfigService) => {
        const namespace = configService.get<string>('REDIS_NAMESPACE')
        return {
          prefix: namespace ? `${namespace}:idempotency:` : 'idempotency:',
        }
      },
      inject: [ConfigService],
    },
    IdempotencyInterceptor,
  ],
  exports: [IdempotencyInterceptor, IDEMPOTENCY_CONFIG],
})
export class IdempotencyModule {}
