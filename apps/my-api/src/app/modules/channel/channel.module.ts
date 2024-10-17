import { Global, Module, Provider } from '@nestjs/common'
import { ChannelRepositoryPrisma } from './channel.repository.prisma'
import { ChannelService } from './channel.service'
import { ChannelRepo } from './channel.repository'

const providers: Provider[] = [
  {
    provide: ChannelRepo,
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
