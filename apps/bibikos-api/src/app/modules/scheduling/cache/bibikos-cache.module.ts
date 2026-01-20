import { Global, Module } from '@nestjs/common'
import { BibikosCacheService } from './bibikos-cache.service'

@Global()
@Module({
  providers: [BibikosCacheService],
  exports: [BibikosCacheService],
})
export class BibikosCacheModule {}
