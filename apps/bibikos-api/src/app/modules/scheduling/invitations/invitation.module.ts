import { Module } from '@nestjs/common'
import { AppUserModule } from '../app-users/app-user.module'
import { ClassModule } from '../classes/class.module'
import { OrganizerModule } from '../organizers/organizer.module'
import { InvitationController } from './invitation.controller'
import { InvitationRepo } from './invitation.repository'
import { InvitationRepositoryPrisma } from './invitation.repository.prisma'
import { InvitationService } from './invitation.service'

@Module({
  imports: [ClassModule, OrganizerModule, AppUserModule],
  controllers: [InvitationController],
  providers: [
    InvitationService,
    {
      provide: InvitationRepo,
      useClass: InvitationRepositoryPrisma,
    },
  ],
  exports: [InvitationService, InvitationRepo],
})
export class InvitationModule {}
