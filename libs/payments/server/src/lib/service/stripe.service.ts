import { toDate } from '@js-monorepo/auth/nest/common/utils'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { CreateProductWithPricesRequest } from '../../'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { StripeClient } from '../stripe.module'
import { PaymentsService } from './payments.service'
import {
  Events,
  UserPresenceWebsocketService,
} from '@js-monorepo/user-presence'
import { Transactional } from '@nestjs-cls/transactional'

@Injectable()
export class StripeService {
  private logger = new Logger(StripeService.name)

  constructor(
    @Inject(StripeClient) private readonly stripe: Stripe,
    private readonly paymentsService: PaymentsService,
    private userPresenceWebsocketService: UserPresenceWebsocketService
  ) {}

  async createCustomer(email: string) {
    return this.stripe.customers.create({
      email,
    })
  }

  @Transactional()
  async createCheckoutSession(priceId: number, userId: number, email: string) {
    try {
      let stripeCustomerId: string

      const price = await this.paymentsService.findPriceById(priceId)

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
        line_items: [{ price: price.stripeId, quantity: 1 }],
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
      `Stripe - RECEIVED Subscription Event with type: ${type}, from stripe user: ${subscriptionData.customer} and price_id: '${subscriptionData.items.data[0]?.price.id}'`
    )

    const paymentCustomer =
      await this.paymentsService.findPaymentCustomerByStripeId(
        subscriptionData.customer as string
      )

    if (!paymentCustomer?.id) {
      this.logger.debug(
        `Payment customer not found for stripe customer: ${subscriptionData.customer}`
      )
      throw new Error(
        `Payment customer not found for stripe customer: ${subscriptionData.customer}`
      )
    }

    const price = await this.paymentsService.findPriceByStripeId(
      subscriptionData.items.data[0]?.price.id
    )

    if (type === 'created') {
      await this.paymentsService.createSubscription({
        paymentCustomerId: paymentCustomer?.id,
        stripeSubscriptionId: subscriptionData.id,
        priceId: price.id,
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
    this.userPresenceWebsocketService.sendToUsers(
      [paymentCustomer.userId],
      Events.refreshSession,
      true
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

  async createProductWithPrices(data: CreateProductWithPricesRequest) {
    const stripeProduct = await this.stripe.products.create({
      name: data.name,
      description: data.description,
    })

    // Create Prices in Stripe
    const stripePrices = await Promise.all(
      data.prices.map((price) =>
        this.stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: price.unitAmount,
          currency: price.currency,
          recurring: {
            interval: price.interval,
          },
        })
      )
    )

    return {
      product: stripeProduct,
      prices: stripePrices,
    }
  }
}
