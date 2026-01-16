import { Global, Module, Provider } from '@nestjs/common'
import { ParticipantController } from './participant.controller'
import { ParticipantRepo } from './participant.repository'
import { ParticipantRepositoryPrisma } from './participant.repository.prisma'
import { ParticipantService } from './participant.service'

const providers: Provider[] = [
  {
    provide: ParticipantRepo,
    useClass: ParticipantRepositoryPrisma,
  },
  ParticipantService,
]

@Global()
@Module({
  controllers: [ParticipantController],
  providers: [...providers],
  exports: [...providers],
})
export class ParticipantModule {}
