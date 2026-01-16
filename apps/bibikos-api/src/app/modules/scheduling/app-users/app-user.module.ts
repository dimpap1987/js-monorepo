import { Global, Module, Provider } from '@nestjs/common'
import { AppUserController } from './app-user.controller'
import { AppUserRepo } from './app-user.repository'
import { AppUserRepositoryPrisma } from './app-user.repository.prisma'
import { AppUserService } from './app-user.service'

const providers: Provider[] = [
  {
    provide: AppUserRepo,
    useClass: AppUserRepositoryPrisma,
  },
  AppUserService,
]

@Global()
@Module({
  controllers: [AppUserController],
  providers: [...providers],
  exports: [...providers],
})
export class AppUserModule {}
