import { toDate } from '@js-monorepo/auth/nest/common/utils'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { tryCatch } from '@js-monorepo/utils/common'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { CreateProductWithPricesRequest, PaymentsModuleOptions } from '../../'
import { StripeClient } from '../stripe.module'
import { PaymentsService } from './payments.service'

@Injectable()
export class StripeService {
  private logger = new Logger(StripeService.name)

  constructor(
    @Inject(StripeClient) private readonly stripe: Stripe,
    private readonly paymentsService: PaymentsService,
    @Inject('PAYMENTS_OPTIONS')
    private readonly paymentsModuleOptions: PaymentsModuleOptions
  ) {}

  async findCustomerByEmail(email: string) {
    const customers = await this.stripe.customers.list({
      email,
    })

    return customers.data.length > 0 ? customers.data[0] : null
  }

  async createCustomer(email: string) {
    return this.stripe.customers.create({
      email,
    })
  }

  async createCustomerIfNotExists(email: string) {
    const existingCustomer = await this.findCustomerByEmail(email)

    if (existingCustomer) {
      this.logger.warn(
        `Customer with email ${email} already exists in stripe`,
        existingCustomer.id
      )
      return existingCustomer
    }

    const newCustomer = await this.createCustomer(email)

    this.logger.log(`New Stripe customer created:`, newCustomer.id)
    return newCustomer
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
        const stripeCustomer = await this.createCustomerIfNotExists(email)
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
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_STRIPE_CHECKOUT')
    }
  }

  async constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!signature) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_INVALID_SIGNATURE')
    }

    if (!webhookSecret) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ERROR_INVALID_STRIPE_WEBHOOK_SECRET'
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
      const sub = await this.paymentsService.createSubscription({
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

      //callback
      tryCatch(() => {
        this.paymentsModuleOptions.onSubscriptionCreateSuccess?.(
          paymentCustomer.userId,
          {
            id: sub.id,
            name: sub.price?.product?.name,
          }
        )
      })
    } else if (type == 'updated') {
      const sub =
        await this.paymentsService.updateSubscription(subscriptionData)

      //callback
      tryCatch(() => {
        this.paymentsModuleOptions.onSubscriptionUpdateSuccess?.(
          paymentCustomer.userId,
          {
            id: sub.id,
            name: sub.price?.product?.name,
          }
        )
      })
    } else if (type == 'deleted') {
      const sub =
        await this.paymentsService.deleteSubscription(subscriptionData)

      //callback
      tryCatch(() => {
        this.paymentsModuleOptions.onSubscriptionDeleteSuccess?.(
          paymentCustomer.userId,
          {
            id: sub.id,
            name: sub.price?.product?.name,
          }
        )
      })
    }

    tryCatch(() => {
      this.paymentsModuleOptions.onSubscriptionEvent?.(
        paymentCustomer.userId,
        type
      )
    })
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

    try {
      switch (event.type) {
        case 'customer.subscription.created':
          return await this.handleSubscriptionEvent(event, 'created')
        case 'customer.subscription.updated':
          return await this.handleSubscriptionEvent(event, 'updated')
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionEvent(event, 'deleted')
        case 'invoice.payment_succeeded':
          return await this.handleInvoiceEvent(event, 'succeeded')
        case 'invoice.payment_failed':
          return await this.handleInvoiceEvent(event, 'failed')
        case 'checkout.session.completed':
          return await this.handleCheckoutSessionCompleted(event)
        default:
          this.logger.warn(`Stripe - unhandled event received: ${event.type}`)
          break
      }
    } catch (e) {
      this.logger.error(
        `There was an Error in stripe webhook event with id:${event.id}`
      )
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

  async cancelSubscription(stripeSubscriptionId: string) {
    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(stripeSubscriptionId)

      // Check if the subscription is already canceled
      if (subscription.status === 'canceled') {
        this.logger.warn(
          `Cannot cancel a subscription that is already canceled. with subscriptionId: '${subscription.id}' and stripe_subscription_id: '${stripeSubscriptionId}'`
        )
        throw new Error(
          'Cannot cancel a subscription that is already canceled.'
        )
      }

      // Update the subscription to cancel at the end of the period
      return await this.stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
    } catch (error) {
      console.error('Error canceling subscription:', error.message)
      throw error
    }
  }
}
