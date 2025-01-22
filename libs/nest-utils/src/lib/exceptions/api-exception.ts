import { HttpException, HttpStatus } from '@nestjs/common'

export class ApiException extends HttpException {
  private readonly errorCode: string

  constructor(status: HttpStatus, errorCode: string, message?: string) {
    super(message ?? 'An unexpected error occurred.', status ?? HttpStatus.INTERNAL_SERVER_ERROR)
    this.errorCode = errorCode
  }

  getErrorCode(): string {
    return this.errorCode
  }
}
