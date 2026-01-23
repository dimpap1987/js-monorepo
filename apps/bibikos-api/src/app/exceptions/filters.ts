import { Prisma } from '@js-monorepo/bibikos-db'
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
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name)
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let errorCode = 'DATABASE_ERROR'

    // 1. Extract metadata for logging
    const model = exception.meta?.modelName || 'UnknownModel'
    const target = (exception.meta?.target as string[])?.join(', ') || 'fields'

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT
        message = `Unique constraint failed on ${model} (${target})`
        errorCode = 'UNIQUE_CONSTRAINT_VIOLATION'
        break
      case 'P2025':
        status = HttpStatus.NOT_FOUND
        message = `${model} record not found`
        errorCode = 'RECORD_NOT_FOUND'
        break
      case 'P2003':
        status = HttpStatus.BAD_REQUEST
        message = `Foreign key constraint failed on ${model}`
        errorCode = 'INVALID_RELATION'
        break
      case 'P2014':
        status = HttpStatus.BAD_REQUEST
        message = `The change you are trying to make would violate the required relation for ${model}`
        errorCode = 'RELATION_VIOLATION'
        break
    }
    const logContext = {
      model,
      errorCode,
      prismaCode: exception.code,
      path: request.url,
      method: request.method,
      meta: exception.meta,
    }

    if (status >= 500) {
      this.logger.error(`[Prisma Error] ${exception.message}`, exception.stack, logContext)
    } else {
      this.logger.warn(`[Prisma Client Error] ${message}`, logContext)
    }

    response.status(status).json({
      createdBy: 'PrismaClientKnownRequestError',
      statusCode: status,
      errorCode: errorCode,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
      errors: [
        {
          message: message ?? 'Something went wrong',
        },
      ],
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
          message: 'Something went wrong',
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
