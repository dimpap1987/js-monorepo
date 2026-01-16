import { Global, Module, Provider } from '@nestjs/common'
import { ClassController } from './class.controller'
import { ClassRepo } from './class.repository'
import { ClassRepositoryPrisma } from './class.repository.prisma'
import { ClassService } from './class.service'

const providers: Provider[] = [
  {
    provide: ClassRepo,
    useClass: ClassRepositoryPrisma,
  },
  ClassService,
]

@Global()
@Module({
  controllers: [ClassController],
  providers: [...providers],
  exports: [...providers],
})
export class ClassModule {}
