import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common'
import { ApiException } from './api-exception'

@Catch(ApiException, HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: ApiException, host: ArgumentsHost) {
    Logger.error(
      `Exception of type: '${exception.name}' - message: '${
        exception.message
      }' - statusCode: '${exception.getStatus()}' - errorCode: '${exception.errorCode}'`
    )
    host.switchToHttp().getResponse().status(exception.getStatus()).json({
      createdBy: 'ApiExceptionFilter',
      errorCode: exception.errorCode,
      message: exception.message,
    })
  }
}
