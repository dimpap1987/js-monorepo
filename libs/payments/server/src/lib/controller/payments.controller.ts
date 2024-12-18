import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { SessionUserType } from '@js-monorepo/types'
import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common'
import { StripeService } from '../service/stripe.service'

@Controller('payments')
export class PaymentsController {
  private logger = new Logger(PaymentsController.name)

  constructor(private readonly stripeService: StripeService) {}

  @Get('plans')
  async getPlans() {
    const plansToSearch = process.env.PRICING_PLANS || ''
    const pricingIds = plansToSearch.split(',').map((name) => name.trim())
    return this.stripeService.findPlansByPriceId(pricingIds)
  }

  @Post('webhook')
  async handleStripeWebhook(@Req() req: RawBodyRequest<Request>) {
    const sig = req.headers['stripe-signature']

    return this.stripeService.handleWebhookEvent(sig, req.rawBody)
  }

  @Post('checkout')
  @UseGuards(LoggedInGuard)
  async createCheckoutSession(
    @Body() { priceId }: { priceId: string },
    @SessionUser() sessionUser: SessionUserType
  ) {
    const { session } = await this.stripeService.createCheckoutSession(
      priceId,
      sessionUser.email
    )
    return { sessionId: session.id }
  }
}
