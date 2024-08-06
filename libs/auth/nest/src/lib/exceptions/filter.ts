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
      }' - url: '${request.url}' statusCode: '${exception.getStatus()}' - errorCode: '${exception.errorCode}'`
    )

    response.clearCookie('accessToken')
    response.clearCookie('refreshToken')

    return response.status(exception.getStatus()).json({
      createdBy: 'AuthExceptionFilter',
      errorCode: exception.errorCode,
      path: request.url,
      errors: [{ message: exception.message }],
    })
  }
}
