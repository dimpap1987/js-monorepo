import { ApiException } from '@js-monorepo/nest/exceptions'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { StripeClient } from '../stripe.module'

@Injectable()
export class StripeService {
  private logger = new Logger(StripeService.name)

  constructor(@Inject(StripeClient) private readonly stripe: Stripe) {}

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

  async createCheckoutSession(priceId: string, email: string) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer_email: email,
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

  async handleWebhookEvent(sig: string, payload: string | Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!sig) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'INVALID_SIGNATURE')
    }

    if (!webhookSecret) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'INVALID_STRIPE_WEBHOOK_SECRET'
      )
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      sig,
      webhookSecret
    )

    await this.handleEvent(event)
    return { received: true }
  }

  private async handleSubscriptionEvent(
    event: Stripe.Event,
    type: 'created' | 'updated' | 'deleted'
  ) {
    this.logger.log(
      `Stripe - RECEIVED Subscription Event: ${JSON.stringify(event)} with type: ${type}`
    )
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
