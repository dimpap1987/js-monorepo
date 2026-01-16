import { Global, Module, Provider } from '@nestjs/common'
import { OrganizerController } from './organizer.controller'
import { OrganizerRepo } from './organizer.repository'
import { OrganizerRepositoryPrisma } from './organizer.repository.prisma'
import { OrganizerService } from './organizer.service'

const providers: Provider[] = [
  {
    provide: OrganizerRepo,
    useClass: OrganizerRepositoryPrisma,
  },
  OrganizerService,
]

@Global()
@Module({
  controllers: [OrganizerController],
  providers: [...providers],
  exports: [...providers],
})
export class OrganizerModule {}
