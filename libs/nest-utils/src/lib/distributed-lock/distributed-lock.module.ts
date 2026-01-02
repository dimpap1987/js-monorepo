import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DistributedLockService, DISTRIBUTED_LOCK_PREFIX } from './distributed-lock.service'

@Global()
@Module({
  providers: [
    {
      provide: DISTRIBUTED_LOCK_PREFIX,
      useFactory: (configService: ConfigService) => {
        const namespace = configService.get<string>('REDIS_NAMESPACE')
        return namespace ? `${namespace}:lock:` : 'lock:'
      },
      inject: [ConfigService],
    },
    DistributedLockService,
  ],
  exports: [DistributedLockService, DISTRIBUTED_LOCK_PREFIX],
})
export class DistributedLockModule {}
