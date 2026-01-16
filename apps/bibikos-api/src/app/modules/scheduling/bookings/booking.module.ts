import { Global, Module, Provider } from '@nestjs/common'
import { BookingController } from './booking.controller'
import { BookingRepo } from './booking.repository'
import { BookingRepositoryPrisma } from './booking.repository.prisma'
import { BookingService } from './booking.service'

const providers: Provider[] = [
  {
    provide: BookingRepo,
    useClass: BookingRepositoryPrisma,
  },
  BookingService,
]

@Global()
@Module({
  controllers: [BookingController],
  providers: [...providers],
  exports: [...providers],
})
export class BookingModule {}
