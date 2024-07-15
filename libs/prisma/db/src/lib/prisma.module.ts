import { Global, Module } from '@nestjs/common'
import { PrismaService } from './db-client'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
