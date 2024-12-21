import { toDate } from '@js-monorepo/auth/nest/common/utils'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { StripeClient } from '../stripe.module'
import { PaymentsService } from './payments.service'

@Injectable()
export class StripeService {
  private logger = new Logger(StripeService.name)

  constructor(
    @Inject(StripeClient) private readonly stripe: Stripe,
    private readonly paymentsService: PaymentsService
  ) {}

  async createCustomer(email: string) {
    return this.stripe.customers.create({
      email,
    })
  }

  async findPlansByPriceId(priceIds?: string[]) {
    try {
      const [products, prices] = await Promise.all([
        this.stripe.products.list(),
        this.stripe.prices.list(),
      ])

      const pricingDetails = prices.data
        .map((price) => {
          const product = products.data.find((pro) => pro.id === price.product)

          if (
            product.active &&
            priceIds?.some((priceId) => priceId === price.id)
          ) {
            return {
              title: product?.name,
              price: price.unit_amount / 100,
              description: product.description,
              features: product.metadata,
              priceId: price.id,
              interval: price.recurring?.interval,
            }
          } else {
            return null
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.price - b.price)

      return pricingDetails
    } catch (e) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'STRIPE_ERROR')
    }
  }

  async createCheckoutSession(priceId: string, userId: number, email: string) {
    try {
      let stripeCustomerId: string

      const paymentCustomer =
        await this.paymentsService.findPaymentCustomerById(userId)

      if (paymentCustomer?.stripeCustomerId) {
        stripeCustomerId = paymentCustomer?.stripeCustomerId
      } else {
        //create payment customer
        const stripeCustomer = await this.createCustomer(email)
        const createdCustomer =
          await this.paymentsService.createPaymentCustomer({
            userId,
            stripeCustomerId: stripeCustomer.id,
          })
        stripeCustomerId = createdCustomer.stripeCustomerId
      }

      // checkout
      const session = await this.stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.AUTH_LOGIN_REDIRECT}/pricing?success=true`,
        cancel_url: `${process.env.AUTH_LOGIN_REDIRECT}/pricing?success=false`,
      })
      return { session: session }
    } catch (e) {
      this.logger.error('Error while checking out', e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'STRIPE_CHECKOUT')
    }
  }

  async constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!signature) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'INVALID_SIGNATURE')
    }

    if (!webhookSecret) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'INVALID_STRIPE_WEBHOOK_SECRET'
      )
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )
  }

  async handleWebhookEvent(sig: string, payload: Buffer) {
    const event = await this.constructEventFromPayload(sig, payload)

    await this.handleEvent(event)
    return { received: true }
  }

  private async handleSubscriptionEvent(
    event: Stripe.Event,
    type: 'created' | 'updated' | 'deleted'
  ) {
    const subscriptionData = event.data.object as Stripe.Subscription

    this.logger.debug(
      `Stripe - RECEIVED Subscription Event: ${JSON.stringify(event)} with type: ${type}, from stripe user: ${subscriptionData.customer}`
    )

    const paymentCustomer =
      await this.paymentsService.findPaymentCustomerByStripeId(
        subscriptionData.customer as string
      )

    if (type === 'created') {
      await this.paymentsService.createSubscription({
        paymentCustomerId: paymentCustomer?.userId,
        stripeSubscriptionId: subscriptionData.id,
        priceId: subscriptionData.items.data[0]?.price.id,
        status: subscriptionData.status,
        currentPeriodStart: toDate(subscriptionData.current_period_start),
        currentPeriodEnd: toDate(subscriptionData.current_period_end),
        trialStart: toDate(subscriptionData.trial_start),
        trialEnd: toDate(subscriptionData.trial_end),
        cancelAt: toDate(subscriptionData.cancel_at),
        canceledAt: toDate(subscriptionData.canceled_at),
      })
    } else if (type == 'updated') {
      await this.paymentsService.updateSubscription(subscriptionData)
    } else if (type == 'deleted') {
      await this.paymentsService.deleteSubscription(subscriptionData)
    }
  }

  private async handleInvoiceEvent(
    event: Stripe.Event,
    status: 'succeeded' | 'failed'
  ) {
    this.logger.log(
      `Stripe - RECEIVED Invoice Event: ${JSON.stringify(event)} with type: ${status}`
    )
  }

  private async handleCheckoutSessionCompleted(event: Stripe.Event) {
    this.logger.log(
      `Stripe - RECEIVED Checkout Session event: ${JSON.stringify(event)}`
    )
  }

  private async handleEvent(event: Stripe.Event) {
    const storedEvent = await this.paymentsService.findStripeWebhookEvent(
      event.id
    )

    if (storedEvent?.result?.id) {
      this.logger.warn(
        `Duplicate stripe event occured. - Stripe - id: ${event.id} type: ${event.type}`
      )
      return
    }

    const newEvent = await this.paymentsService.createStripeWebhookEvent({
      eventId: event.id,
      eventType: event.type,
    })

    if (newEvent.error) {
      this.logger.error('Error while storing stripe event')
    }

    switch (event.type) {
      case 'customer.subscription.created':
        return this.handleSubscriptionEvent(event, 'created')
      case 'customer.subscription.updated':
        return this.handleSubscriptionEvent(event, 'updated')
      case 'customer.subscription.deleted':
        return this.handleSubscriptionEvent(event, 'deleted')
      case 'invoice.payment_succeeded':
        return this.handleInvoiceEvent(event, 'succeeded')
      case 'invoice.payment_failed':
        return this.handleInvoiceEvent(event, 'failed')
      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(event)
      default:
        this.logger.warn(`Stripe - unhandled event received: ${event.type}`)
        break
    }
  }
}
