import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { SessionUserType } from '@js-monorepo/types'
import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { RequestWithRawBody } from '../rawBody.middleware'
import { PaymentsService } from '../service/payments.service'
import { StripeService } from '../service/stripe.service'

@Controller('payments')
export class PaymentsController {
  private logger = new Logger(PaymentsController.name)

  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentsService
  ) {}

  @Get('plans')
  async getPlans() {
    const plansToSearch = process.env.PRICING_PLANS || ''
    const pricingIds = plansToSearch.split(',').map((name) => name.trim())
    return this.paymentsService.findActiveProductsWithPrices()
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody
  ) {
    return this.stripeService.handleWebhookEvent(signature, request.rawBody)
  }

  @Post('checkout')
  @UseGuards(LoggedInGuard)
  async createCheckoutSession(
    @Body() { priceId }: { priceId: string },
    @SessionUser() sessionUser: SessionUserType
  ) {
    const { session } = await this.stripeService.createCheckoutSession(
      priceId,
      sessionUser.id,
      sessionUser.email
    )
    return { sessionId: session.id }
  }
}
