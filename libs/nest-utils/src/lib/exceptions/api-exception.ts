import { HttpException, HttpStatus } from '@nestjs/common'

export class ApiException extends HttpException {
  private static readonly defaultMessage = 'Something went wrong.'

  errorCode: string | undefined

  constructor(
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    message: string = ApiException.defaultMessage,
    errorCode?: string
  ) {
    super(message, status)
    this.errorCode = errorCode
  }
}
