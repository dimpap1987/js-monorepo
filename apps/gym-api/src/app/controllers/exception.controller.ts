import { Body, Controller, Logger, Post } from '@nestjs/common'

@Controller('exceptions')
export class ExceptionController {
  private readonly logger = new Logger(ExceptionController.name)

  @Post()
  async save<T>(@Body() requestBody: T) {
    this.logger.error(`A client side error has occured`, requestBody)
    return {
      message: ' exception submitted',
    }
  }
}
