import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { SessionUserType } from '@js-monorepo/types'
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { RequestWithRawBody } from '../rawBody.middleware'
import { PaymentsService } from '../service/payments.service'
import { StripeService } from '../service/stripe.service'
import { tryCatch } from '@js-monorepo/utils/common'
import { ApiException } from '@js-monorepo/nest/exceptions'

@Controller('payments')
export class PaymentsController {
  private logger = new Logger(PaymentsController.name)

  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentsService
  ) {}

  @Get('plans')
  async getPlans() {
    return this.paymentsService.findActiveProductsWithPrices()
  }

  @Get('subscriptions/:subscriptionId')
  async getSubscription(@Param('subscriptionId') subscriptionId: number) {
    return this.paymentsService.findSubscriptionByid(subscriptionId)
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
    @Body() { priceId }: { priceId: number },
    @SessionUser() sessionUser: SessionUserType
  ) {
    const { session } = await this.stripeService.createCheckoutSession(
      priceId,
      sessionUser.id,
      sessionUser.email
    )
    return { sessionId: session.id }
  }

  @Post('cancel')
  @UseGuards(LoggedInGuard)
  async cancelSubscription(
    @Body() { priceId }: { priceId: number },
    @SessionUser() sessionUser: SessionUserType
  ) {
    const subscription =
      await this.paymentsService.findSubscriptionByPriceIdAndUserId(
        priceId,
        sessionUser.id
      )

    const { error } = await tryCatch(() =>
      this.stripeService.cancelSubscription(subscription.stripeSubscriptionId)
    )
    if (error) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'FETCH_SUBSCRIPTION_STRIPE_CANCEL'
      )
    }

    return {
      success: true,
    }
  }
}
