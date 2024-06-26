import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common'
import { AuthException } from './api-exception'

@Catch(AuthException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: AuthException, host: ArgumentsHost) {
    Logger.error(
      `Exception of type: 'AuthExceptionFilter' - message: '${
        exception.message
      }' - statusCode: '${exception.getStatus()}' - errorCode: '${exception.errorCode}'`
    )
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    return response.status(exception.getStatus()).json({
      createdBy: 'AuthExceptionFilter',
      errorCode: exception.errorCode,
      path: request.url,
      errors: [{ message: exception.message }],
    })
  }
}
