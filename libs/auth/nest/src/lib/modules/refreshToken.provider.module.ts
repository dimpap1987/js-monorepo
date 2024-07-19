import { Global, Module, Provider } from '@nestjs/common'
import { RefreshTokenRepositoryPrismaImpl } from '../repositories/implementations/prisma/refreshToken.repository'
import { RefreshTokenServiceImpl } from '../services/implementations/refreshToken.service'

const providers: Provider[] = [
  {
    provide: 'REFRESH_TOKEN_REPOSITORY',
    useClass: RefreshTokenRepositoryPrismaImpl,
  },
  {
    provide: 'REFRESH_TOKEN_SERVICE',
    useClass: RefreshTokenServiceImpl,
  },
]

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class RefreshTokenProviderModule {}
