import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { AuthException } from './api-exception'

@Catch(AuthException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: AuthException, host: ArgumentsHost) {
    Logger.error(
      `Exception of type: '${exception.name}' - message: '${
        exception.message
      }' - statusCode: '${exception.getStatus()}' - errorCode: '${exception.errorCode}'`
    )
    host
      .switchToHttp()
      .getResponse()
      .status(exception.getStatus())
      .json({
        createdBy: 'AuthExceptionFilter',
        errorCode: exception.errorCode,
        errors: [{ message: exception.message }],
      })
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    Logger.error(
      `Exception of type: '${exception.name}' - message: '${
        exception.message
      }' - statusCode: '${exception.getStatus()}'`
    )
    host
      .switchToHttp()
      .getResponse()
      .status(exception.getStatus())
      .json({
        createdBy: 'HttpExceptionFilter',
        errors: [
          {
            message: exception.message,
          },
        ],
      })
  }
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  override catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost
  ) {
    Logger.error(
      `Exception of type: '${exception.name}' - message: '${exception.message}' - code: '${exception.code}'`
    )
    host
      .switchToHttp()
      .getResponse()
      .status(400)
      .json({
        createdBy: 'PrismaClientKnownRequestError',
        // errorCode: exception.errorCode,
        errors: [{ message: exception.message }],
      })
  }
}

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const errorMessage = exception.response?.message
    Logger.error(
      `Exception of type: '${exception.name}' - message: '${
        errorMessage ? errorMessage : exception.message
      }'`
    )
    host
      .switchToHttp()
      .getResponse()
      .status(400)
      .json({
        createdBy: 'BadRequestExceptionFilter',
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
      `Exception of type: '${exception.name}' - message: '${exception.message}'`
    )
    host
      .switchToHttp()
      .getResponse()
      .status(400)
      .json({
        createdBy: 'ZodExceptionFilter',
        errors: exception.issues ?? [{ message: 'Something went wrong' }],
      })
  }
}
