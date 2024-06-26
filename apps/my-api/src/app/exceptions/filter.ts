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
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { ApiException } from './api-exception'

const INTERNAL_ERROR = 'Internal server error'

@Catch(ApiException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: ApiException, host: ArgumentsHost) {
    Logger.error(
      `Exception of type: 'ApiException' - message: '${
        exception.message
      }' - statusCode: '${exception.getStatus()}' - errorCode: '${exception.errorCode}'`
    )

    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    return response.status(exception.getStatus()).json({
      createdBy: 'ApiExceptionFilter',
      errorCode: exception.errorCode,
      path: request.url,
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
        `Generic Exception - 'HttpException' - message: '${exception.message}'`,
        exception
      )
    } else if (exception instanceof Error) {
      message = exception.message
      Logger.error(
        `Generic Exception - 'Error' - message: '${exception.message}'`,
        exception
      )
    } else {
      Logger.error(`Generic Exception - unkown error happened`, exception)
    }

    return response.status(status).json({
      createdBy: 'GlobalExceptionFilter',
      path: request.url,
      errors: [
        {
          message: message?.trim().length ? message : INTERNAL_ERROR,
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
      `Exception of type: 'PrismaClientKnownRequestError' - message: '${exception.message}' - code: '${exception.code}'`
    )

    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    return response.status(400).json({
      createdBy: 'PrismaClientKnownRequestError',
      path: request.url,
      errors: [{ message: exception.message }],
    })
  }
}

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const errorMessage = exception.response?.message
    Logger.error(
      `Exception of type: 'BadRequestException' - message: '${
        errorMessage ? errorMessage : exception.message
      }'`
    )

    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    return response.status(400).json({
      createdBy: 'BadRequestExceptionFilter',
      path: request.url,
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
      `Exception of type: 'ZodError' - message: '${exception.message}'`
    )
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    return response.status(400).json({
      createdBy: 'ZodExceptionFilter',
      path: request.url,
      errors: exception.issues ?? [{ message: 'Something went wrong' }],
    })
  }
}
