import { Global, Module, Provider } from '@nestjs/common'
import { ClassTagRepo } from './tags.repository'
import { ClassTagRepositoryPrisma } from './tags.repository.prisma'
import { ClassTagService } from './tags.service'

const providers: Provider[] = [
  {
    provide: ClassTagRepo,
    useClass: ClassTagRepositoryPrisma,
  },
  ClassTagService,
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class ClassTagModule {}
