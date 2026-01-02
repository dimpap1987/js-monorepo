import { DistributedLockService } from '@js-monorepo/nest/distributed-lock'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { tryCatch } from '@js-monorepo/utils/common'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaymentsClient, StripeProvider, type WebhookEvent } from '@super-dp/payments-core'
import { CreateProductWithPricesRequest, PaymentsModuleOptions } from '../../'
import { CancelReason } from '../constants'
import { InvoiceDto, InvoiceListResponse, InvoiceStatus } from '../dto/invoice.dto'
import { PaymentsClientToken, StripeProviderToken } from '../stripe.module'
import { timestampToDate, timestampToDateRequired, withRetry } from '../utils'
import { PaymentsService } from './payments.service'

@Injectable()
export class StripeService {
  private logger = new Logger(StripeService.name)

  constructor(
    @Inject(PaymentsClientToken) private readonly paymentsClient: PaymentsClient,
    @Inject(StripeProviderToken) private readonly stripeProvider: StripeProvider,
    private readonly paymentsService: PaymentsService,
    @Inject('PAYMENTS_OPTIONS')
    private readonly paymentsModuleOptions: PaymentsModuleOptions,
    private readonly configService: ConfigService,
    private readonly distributedLockService: DistributedLockService
  ) {}

  async findCustomerByEmail(email: string) {
    return this.paymentsClient.findCustomerByEmail(email)
  }

  async createCustomer(params?: { email: string; name?: string; metadata?: Record<string, string> }) {
    return this.paymentsClient.createCustomer({
      email: params?.email || '',
      name: params?.name,
      metadata: params?.metadata,
    })
  }

  async createCustomerIfNotExists(email: string) {
    const existingCustomer = await this.findCustomerByEmail(email)

    if (existingCustomer) {
      this.logger.warn(`Customer with email ${email} already exists in stripe`, existingCustomer.id)
      return existingCustomer
    }

    const newCustomer = await this.createCustomer({ email })

    this.logger.log(`New Stripe customer created:`, newCustomer.id)
    return newCustomer
  }

  @Transactional()
  async createCheckoutSession(priceId: number, userId: number, email: string) {
    try {
      const price = await this.paymentsService.findPriceById(priceId)
      const stripeCustomerId = await this.getOrCreateStripeCustomer(userId, email)

      const session = await withRetry(() =>
        this.paymentsClient.createCheckoutSession({
          customerId: stripeCustomerId,
          priceId: price.stripeId,
          successUrl: `${this.configService.get('AUTH_LOGIN_REDIRECT')}/pricing?success=true`,
          cancelUrl: `${this.configService.get('AUTH_LOGIN_REDIRECT')}/pricing?success=false`,
        })
      )

      return { session }
    } catch (e) {
      this.logger.error('Error while checking out', e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_STRIPE_CHECKOUT')
    }
  }

  private async getOrCreateStripeCustomer(userId: number, email: string): Promise<string> {
    const paymentCustomer = await this.paymentsService.findPaymentCustomerById(userId)

    if (paymentCustomer?.stripeCustomerId) {
      return this.validateOrCreateCustomer(paymentCustomer.stripeCustomerId, email, userId)
    }

    const stripeCustomer = await this.createCustomerIfNotExists(email)
    const createdCustomer = await this.paymentsService.createOrUpdatePaymentCustomer({
      userId,
      stripeCustomerId: stripeCustomer.id,
    })

    return createdCustomer.stripeCustomerId
  }

  async constructEventFromPayload(signature: string, payload: Buffer) {
    if (!signature) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_INVALID_SIGNATURE')
    }

    try {
      return this.paymentsClient.constructWebhookEvent(payload, signature)
    } catch (error) {
      this.logger.error('Error constructing webhook event:', error.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_INVALID_STRIPE_WEBHOOK_SECRET')
    }
  }

  async handleWebhookEvent(sig: string, payload: Buffer) {
    if (!sig) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_INVALID_SIGNATURE')
    }

    const event = this.paymentsClient.constructWebhookEvent(payload, sig)

    // Use distributed lock to prevent duplicate processing across instances
    const lockKey = `webhook:stripe:${event.id}`
    const lockResult = await this.distributedLockService.withLock(
      lockKey,
      async () => {
        // Double-check if event was already processed (inside lock)
        const storedEvent = await this.paymentsService.findStripeWebhookEvent(event.id)

        if (storedEvent?.result?.id) {
          this.logger.warn(`Duplicate stripe event occurred. - Stripe - id: ${event.id} type: ${event.type}`)
          return { received: true, alreadyProcessed: true }
        }

        // Mark event as being processed
        await this.paymentsService.createStripeWebhookEvent({
          eventId: event.id,
          eventType: event.type,
        })

        try {
          await this.paymentsClient.handleWebhookEvent(payload, sig, {
            onSubscriptionCreated: (evt) => this.handleSubscriptionEvent(evt, 'created'),
            onSubscriptionUpdated: (evt) => this.handleSubscriptionEvent(evt, 'updated'),
            onSubscriptionDeleted: (evt) => this.handleSubscriptionEvent(evt, 'deleted'),
            onInvoicePaymentSucceeded: (evt) => this.handleInvoiceEvent(evt, 'succeeded'),
            onInvoicePaymentFailed: (evt) => this.handleInvoiceEvent(evt, 'failed'),
            onCheckoutSessionCompleted: (evt) => this.handleCheckoutSessionCompleted(evt),
            onOther: (evt) => {
              this.logger.warn(`Stripe - unhandled event received: ${evt.type}`)
            },
          })
        } catch (e) {
          this.logger.error(`There was an Error in stripe webhook event with id:${event.id}`, e.stack)
        }

        return { received: true, alreadyProcessed: false }
      },
      { ttlSeconds: 60 }
    )

    if (!lockResult.success) {
      // Another instance is processing this event
      this.logger.debug(`Webhook event ${event.id} is being processed by another instance`)
      return { received: true }
    }

    return { received: true }
  }

  private async handleSubscriptionEvent(event: WebhookEvent, type: 'created' | 'updated' | 'deleted') {
    const subscriptionData = event.data.object as Record<string, unknown>

    const subscriptionId = subscriptionData.id as string
    const customerId = subscriptionData.customer as string
    const status = subscriptionData.status as string
    const items = subscriptionData.items as { data: Array<{ price: { id: string } }> }

    this.logger.log(
      `Payments - RECEIVED Subscription Event with type: ${type}, customer: ${customerId} and price_id: '${items?.data?.[0]?.price?.id}'`
    )

    const paymentCustomer = await this.paymentsService.findPaymentCustomerByStripeId(customerId)

    if (!paymentCustomer?.id) {
      this.logger.debug(`Payment customer not found for customer: ${customerId}`)
      throw new Error(`Payment customer not found for customer: ${customerId}`)
    }

    const priceId = items?.data?.[0]?.price?.id
    if (!priceId) {
      throw new Error(`No price found in subscription event: ${subscriptionId}`)
    }

    const price = await this.paymentsService.findPriceByStripeId(priceId)

    if (type === 'created') {
      // Check if user has an active trial for this product - convert it instead of creating new
      const existingTrialForProduct = await this.paymentsService.findActiveTrialForProduct(
        paymentCustomer.userId,
        price.product.id
      )

      let sub
      if (existingTrialForProduct) {
        // Convert trial to paid subscription (same product)
        this.logger.log(
          `Converting trial subscription ${existingTrialForProduct.id} to paid for user ${paymentCustomer.userId}`
        )
        sub = await this.paymentsService.convertTrialToPaid(existingTrialForProduct.id, {
          stripeSubscriptionId: subscriptionId,
          status,
          currentPeriodStart: timestampToDateRequired(subscriptionData.current_period_start as number),
          currentPeriodEnd: timestampToDateRequired(subscriptionData.current_period_end as number),
        })
      } else {
        // Check if user has a trial for a DIFFERENT product - cancel it
        const anyActiveTrial = await this.paymentsService.findActiveTrialForUser(paymentCustomer.userId)
        if (anyActiveTrial) {
          this.logger.log(
            `Canceling trial ${anyActiveTrial.id} (${anyActiveTrial.price.product.name}) - user upgrading to ${price.product.name}`
          )
          await this.paymentsService.cancelTrialSubscription(anyActiveTrial.id)
        }

        // Create new subscription
        sub = await this.paymentsService.createSubscription({
          paymentCustomerId: paymentCustomer.id,
          stripeSubscriptionId: subscriptionId,
          priceId: price.id,
          status,
          currentPeriodStart: timestampToDateRequired(subscriptionData.current_period_start as number),
          currentPeriodEnd: timestampToDateRequired(subscriptionData.current_period_end as number),
          trialStart: timestampToDate(subscriptionData.trial_start as number | null),
          trialEnd: timestampToDate(subscriptionData.trial_end as number | null),
          cancelAt: timestampToDate(subscriptionData.cancel_at as number | null),
          canceledAt: timestampToDate(subscriptionData.canceled_at as number | null),
        })
      }

      tryCatch(() => {
        this.paymentsModuleOptions.onSubscriptionCreateSuccess?.(paymentCustomer.userId, {
          id: sub.id,
          name: price.product?.name,
        })
      })
    } else if (type === 'updated') {
      // Fetch existing subscription to detect renewals (cancelAt was set, now cleared)
      const existingSubscription = await this.paymentsService.findSubscriptionByStripeId(subscriptionId)
      const isRenewal = existingSubscription?.cancelAt && !subscriptionData.cancel_at

      // When cancel_at is null (subscription renewed), explicitly pass null to clear cancelReason in DB
      const cancelReason = subscriptionData.cancel_at ? CancelReason.USER_REQUESTED : null

      const sub = await this.paymentsService.updateSubscription({
        id: subscriptionId,
        status,
        current_period_start: subscriptionData.current_period_start as number,
        current_period_end: subscriptionData.current_period_end as number,
        trial_start: subscriptionData.trial_start as number | null,
        trial_end: subscriptionData.trial_end as number | null,
        cancel_at: subscriptionData.cancel_at as number | null,
        canceled_at: subscriptionData.canceled_at as number | null,
        cancelReason,
        items: {
          data: items.data,
        },
      })

      tryCatch(() => {
        this.paymentsModuleOptions.onSubscriptionUpdateSuccess?.(paymentCustomer.userId, {
          id: sub.id,
          name: price.product?.name,
          cancelAt: timestampToDate(subscriptionData.cancel_at as number | null) ?? undefined,
        })
      })

      // Renewal: subscription was scheduled to cancel but user renewed it
      if (isRenewal) {
        tryCatch(() => {
          this.paymentsModuleOptions.onSubscriptionRenewSuccess?.(paymentCustomer.userId, {
            id: sub.id,
            name: price.product?.name,
          })
        })
      }

      // Cancellation scheduled
      if (subscriptionData.cancel_at) {
        tryCatch(() => {
          this.paymentsModuleOptions.onSubscriptionDeleteSuccess?.(paymentCustomer.userId, {
            id: sub.id,
            name: price.product?.name,
            cancelAt: timestampToDate(subscriptionData.cancel_at as number),
          })
        })
      }
    } else if (type === 'deleted') {
      const sub = await this.paymentsService.deleteSubscription({
        id: subscriptionId,
        status,
        cancel_at: subscriptionData.cancel_at as number | null,
        cancelReason: CancelReason.EXPIRED,
      })

      tryCatch(() => {
        this.paymentsModuleOptions.onSubscriptionExpiredSuccess?.(paymentCustomer.userId, {
          id: sub.id,
          name: price.product?.name,
        })
      })
    }

    tryCatch(() => {
      this.paymentsModuleOptions.onSubscriptionEvent?.(paymentCustomer.userId, type)
    })
  }

  private async handleInvoiceEvent(event: WebhookEvent, status: 'succeeded' | 'failed') {
    this.logger.log(`Stripe - RECEIVED Invoice Event: ${JSON.stringify(event)} with type: ${status}`)
  }

  private async handleCheckoutSessionCompleted(event: WebhookEvent) {
    this.logger.log(`Stripe - RECEIVED Checkout Session event: ${JSON.stringify(event)}`)
  }

  async createProductWithPrices(data: CreateProductWithPricesRequest) {
    return this.paymentsClient.createProductWithPrices({
      name: data.name,
      description: data.description,
      prices: data.prices.map((price) => ({
        unitAmount: price.unitAmount,
        currency: price.currency,
        interval: price.interval,
      })),
    })
  }

  async cancelSubscription(stripeSubscriptionId: string) {
    try {
      return await this.paymentsClient.cancelSubscription({
        subscriptionId: stripeSubscriptionId,
        cancelImmediately: false,
      })
    } catch (error) {
      this.logger.error('Error canceling subscription:', error.stack)
      throw error
    }
  }

  async renewSubscription(stripeSubscriptionId: string) {
    try {
      return await this.paymentsClient.reactivateSubscription(stripeSubscriptionId)
    } catch (error) {
      this.logger.error('Error renewing subscription:', error.stack)
      throw error
    }
  }

  async createPortalSession(stripeCustomerId: string, returnUrl: string) {
    try {
      const stripe = this.stripeProvider.getStripeClient()
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl,
      })
      return { url: session.url }
    } catch (error) {
      this.logger.error('Error creating portal session:', error.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CREATING_PORTAL_SESSION')
    }
  }

  async validateOrCreateCustomer(stripeCustomerId: string, email: string, userId: number) {
    try {
      await this.paymentsClient.getCustomer(stripeCustomerId)
      return stripeCustomerId
    } catch (error) {
      const stripeCustomer = await this.createCustomer({
        email,
      })

      const createdCustomer = await this.paymentsService.createOrUpdatePaymentCustomer({
        userId,
        stripeCustomerId: stripeCustomer.id,
      })
      return createdCustomer.stripeCustomerId
    }
  }

  async listInvoices(stripeCustomerId: string, limit = 10, startingAfter?: string): Promise<InvoiceListResponse> {
    try {
      const stripe = this.stripeProvider.getStripeClient()

      const invoices = await stripe.invoices.list({
        customer: stripeCustomerId,
        limit,
        starting_after: startingAfter,
        expand: ['data.subscription'],
      })

      return {
        invoices: invoices.data.map((invoice) => this.toInvoiceDto(invoice)),
        hasMore: invoices.has_more,
      }
    } catch (error) {
      this.logger.error('Error listing invoices:', error.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_LISTING_INVOICES')
    }
  }

  private toInvoiceDto(invoice: {
    id: string
    number: string | null
    amount_paid: number
    currency: string
    status: string | null
    created: number
    invoice_pdf?: string | null
    hosted_invoice_url?: string | null
  }): InvoiceDto {
    return {
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: (invoice.status || 'draft') as InvoiceStatus,
      createdAt: new Date(invoice.created * 1000),
      pdfUrl: invoice.invoice_pdf ?? null,
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    }
  }
}
