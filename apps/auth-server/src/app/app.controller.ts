import { Controller, Get, HttpStatus, Req } from '@nestjs/common'

import { JwtError, decode, sign, verify } from '@js-monorepo/utils'
import { AppService } from './app.service'
import { ApiException } from './exceptions/api-exception'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
