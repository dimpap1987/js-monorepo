import { Global, Module, Provider } from '@nestjs/common'
import { ClassScheduleController } from './class-schedule.controller'
import { ClassScheduleRepo } from './class-schedule.repository'
import { ClassScheduleRepositoryPrisma } from './class-schedule.repository.prisma'
import { ClassScheduleService } from './class-schedule.service'

const providers: Provider[] = [
  {
    provide: ClassScheduleRepo,
    useClass: ClassScheduleRepositoryPrisma,
  },
  ClassScheduleService,
]

@Global()
@Module({
  controllers: [ClassScheduleController],
  providers: [...providers],
  exports: [...providers],
})
export class ClassScheduleModule {}
