import { HttpStatus, Injectable } from '@nestjs/common'
import { StripeService } from './stripe.service'
import { ApiException } from '@js-monorepo/nest/exceptions'

@Injectable()
export class PaymentsService {
  constructor(private readonly stripeService: StripeService) {}
}
