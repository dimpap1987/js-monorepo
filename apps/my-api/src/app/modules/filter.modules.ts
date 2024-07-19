import { Global, Module, Provider } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import {
  ApiExceptionFilter,
  BadRequestExceptionFilter,
  GlobalExceptionFilter,
  PrismaClientExceptionFilter,
  ZodExceptionFilter,
} from '../exceptions/filter'

const providers: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: BadRequestExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: ZodExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: PrismaClientExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: ApiExceptionFilter,
  },
]

@Global()
@Module({
  providers: [...providers],
})
export class FilterProviderModule {}
