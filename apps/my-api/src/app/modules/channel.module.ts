import { Global, Module, Provider } from '@nestjs/common'
import { ChannelRepositoryPrisma } from '../repositories/implementations/prisma/channel.repository.prisma'
import { ChannelService } from '../services/channel.service'

const providers: Provider[] = [
  {
    provide: 'CHANNEL_REPOSITORY',
    useClass: ChannelRepositoryPrisma,
  },
  ChannelService,
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class ChannelProviderModule {}
