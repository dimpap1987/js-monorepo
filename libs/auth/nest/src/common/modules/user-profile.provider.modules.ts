import { Global, Module, Provider } from '@nestjs/common'
import { UserProfileRepositoryPrismaImpl } from '../repositories/implementations/prisma/user-profile.repository'
import { UserProfileServiceImpl } from '../services/implementations/user-profile.service'
import { RepoUserProfile, ServiceUserProfile } from '../types'

const providers: Provider[] = [
  {
    provide: RepoUserProfile,
    useClass: UserProfileRepositoryPrismaImpl,
  },
  {
    provide: ServiceUserProfile,
    useClass: UserProfileServiceImpl,
  },
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class UserProfileProviderModule {}
