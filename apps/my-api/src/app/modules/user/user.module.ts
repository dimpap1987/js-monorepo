import { Global, Module, Provider } from '@nestjs/common'
import { UserRepo } from './user.repository'
import { UserRepositoryPrisma } from './user.repository.prisma'
import { UserController } from './user.controller'
import { UserService } from './user.service'

const providers: Provider[] = [
  {
    provide: UserRepo,
    useClass: UserRepositoryPrisma,
  },
  UserService,
]

@Global()
@Module({
  imports: [],
  controllers: [UserController],
  providers: [...providers],
  exports: [...providers],
})
export class UserModule {}
