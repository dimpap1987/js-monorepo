import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common'
import { AuthException } from './api-exception'

@Catch(AuthException)
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthExceptionFilter.name)

  catch(exception: AuthException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()
    this.logger.warn(
      `'${
        exception.message
      }' - url: '${request.originalUrl}' statusCode: '${exception.getStatus()}' ${exception.errorCode ? '- errorCode: ' + exception.errorCode : ''}`
    )

    return response.status(exception.getStatus()).json({
      createdBy: 'AuthExceptionFilter',
      errorCode: exception.errorCode,
      path: request.originalUrl,
      errors: [{ message: exception.message }],
    })
  }
}
