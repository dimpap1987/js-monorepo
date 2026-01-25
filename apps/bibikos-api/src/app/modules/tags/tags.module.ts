import { Global, Module, Provider } from '@nestjs/common'
import { TagCategoryRepo, TagRepo } from './repositories/tag.repository'
import { TagCategoryRepositoryPrisma, TagRepositoryPrisma } from './repositories/tag.repository.prisma'
import { TagService } from './tag.service'
import { TagsController } from './tags.controller'

const providers: Provider[] = [
  {
    provide: TagRepo,
    useClass: TagRepositoryPrisma,
  },
  {
    provide: TagCategoryRepo,
    useClass: TagCategoryRepositoryPrisma,
  },
  TagService,
]

@Global()
@Module({
  controllers: [TagsController],
  providers: [...providers],
  exports: [...providers],
})
export class TagsModule {}
