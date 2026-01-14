import { ApiException } from '@js-monorepo/nest/exceptions'
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@js-monorepo/gym-db'
import { ZodError } from 'zod'

const INTERNAL_ERROR = 'Internal server error'

@Catch(ApiException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: ApiException, host: ArgumentsHost) {
    Logger.error(
      `'${
        exception.message
      }' - statusCode: '${exception.getStatus()}' ${exception.getErrorCode() ? '- errorCode: ' + exception.getErrorCode() : ''}`,
      exception.stack,
      ApiException.name
    )

    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    return response.status(exception.getStatus()).json({
      createdBy: 'ApiExceptionFilter',
      errorCode: exception.getErrorCode(),
      path: request.originalUrl,
      message: exception.message,
    })
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      message = exception.message
      Logger.error(
        `'HttpException' - path: '${request.originalUrl}' - message: '${exception.message}'`,
        exception.stack,
        GlobalExceptionFilter.name
      )
    } else if (exception instanceof Error) {
      message = exception.message
      Logger.error(
        `'Error' - path: '${request.originalUrl}' - message: '${exception.message}'`,
        exception.stack,
        GlobalExceptionFilter.name
      )
    } else {
      message = INTERNAL_ERROR
      Logger.error(`Unknown error happened - path: '${request.originalUrl}'`, exception, GlobalExceptionFilter.name)
    }

    return response.status(status).json({
      createdBy: 'GlobalExceptionFilter',
      path: request.originalUrl,
      errors: [
        {
          message: message || INTERNAL_ERROR,
        },
      ],
    })
  }
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  override catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    Logger.error(
      `Exception of type: 'PrismaClientKnownRequestError' - message: '${exception.message}' - code: '${exception.code}'`,
      exception.stack,
      PrismaClientExceptionFilter.name
    )

    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    return response.status(400).json({
      createdBy: 'PrismaClientKnownRequestError',
      path: request.originalUrl,
      errors: [{ message: exception.message }],
    })
  }
}

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const errorMessage = exception.response?.message
    Logger.error(
      `Exception of type: 'BadRequestException' - message: '${errorMessage ? errorMessage : exception.message}'`,
      exception.stack,
      BadRequestExceptionFilter.name
    )

    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    return response.status(400).json({
      createdBy: 'BadRequestExceptionFilter',
      path: request.originalUrl,
      errors: [
        {
          message: errorMessage ?? 'Something went wrong',
        },
      ],
    })
  }
}

@Catch(ZodError)
export class ZodExceptionFilter<T extends ZodError> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    Logger.error(
      `Exception of type: 'ZodError' - message: '${exception.message}'`,
      exception.stack,
      ZodExceptionFilter.name
    )
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    return response.status(400).json({
      createdBy: 'ZodExceptionFilter',
      path: request.originalUrl,
      errors: exception.issues ?? [{ message: 'Something went wrong' }],
    })
  }
}
