import { Global, Module, Provider } from '@nestjs/common'
import { LocationController } from './location.controller'
import { LocationRepo } from './location.repository'
import { LocationRepositoryPrisma } from './location.repository.prisma'
import { LocationService } from './location.service'

const providers: Provider[] = [
  {
    provide: LocationRepo,
    useClass: LocationRepositoryPrisma,
  },
  LocationService,
]

@Global()
@Module({
  controllers: [LocationController],
  providers: [...providers],
  exports: [...providers],
})
export class LocationModule {}
