import { Global, Module, Provider } from '@nestjs/common'
import { AuthRepositoryPrismaImpl } from '../repositories/implementations/prisma/auth.repository'
import { AuthServiceImpl } from '../services/implementations/auth.service'

// const AuthService = Symbol('AuthService')

const providers: Provider[] = [
  {
    provide: 'AUTH_REPOSITORY',
    useClass: AuthRepositoryPrismaImpl,
  },
  {
    provide: 'AUTH_SERVICE',
    useClass: AuthServiceImpl,
  },
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class AuthProviderModule {}
