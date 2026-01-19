import { Global, Module, Provider } from '@nestjs/common'
import { InvitationController } from './invitation.controller'
import { InvitationRepo } from './invitation.repository'
import { InvitationRepositoryPrisma } from './invitation.repository.prisma'
import { InvitationService } from './invitation.service'

const providers: Provider[] = [
  InvitationService,
  {
    provide: InvitationRepo,
    useClass: InvitationRepositoryPrisma,
  },
]

@Global()
@Module({
  controllers: [InvitationController],
  providers: [...providers],
  exports: [...providers],
})
export class InvitationModule {}
