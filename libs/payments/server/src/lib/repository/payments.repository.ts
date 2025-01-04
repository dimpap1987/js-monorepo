import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { CreateSubscriptionDto } from '../dto/create-subscription.dto'
import { CreateStripeWebhookEventDto } from '../dto/stripe-event.dto'
import { Injectable } from '@nestjs/common'
import Stripe from 'stripe'
import { toDate } from '@js-monorepo/auth/nest/common/utils'
import { CreateProductType } from '../../'

@Injectable()
export class PaymentsRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>
  ) {}

  async createProduct(payload: CreateProductType) {
    return this.txHost.tx.product.create({
      data: {
        stripeId: payload.stripeId,
        name: payload.name,
        description: payload.description || '',
        features: payload.features,
        prices: {
          create: payload.prices.map((stripePrice) => ({
            stripeId: stripePrice.stripePrice,
            unitAmount: stripePrice.unitAmount,
            currency: stripePrice.currency,
            interval: stripePrice.interval,
          })),
        },
      },
      include: {
        prices: true,
      },
    })
  }

  async createSubscription(payload: CreateSubscriptionDto) {
    return this.txHost.tx.subscription.create({
      data: payload,
    })
  }

  async createPaymentCustomer(payload: {
    stripeCustomerId: string
    userId: number
  }) {
    return this.txHost.tx.paymentCustomer.create({
      data: payload,
    })
  }

  async createStripeWebhookEvent(payload: CreateStripeWebhookEventDto) {
    return this.txHost.tx.stripeWebhookEvent.create({
      data: {
        eventId: payload.eventId,
        eventType: payload.eventType,
      },
    })
  }

  async handleSubscriptionUpdated(subscriptionData: Stripe.Subscription) {
    return this.txHost.tx.subscription.update({
      where: { stripeSubscriptionId: subscriptionData.id },
      data: {
        priceId: subscriptionData.items.data[0]?.price.id,
        status: subscriptionData.status,
        currentPeriodStart: toDate(subscriptionData.current_period_start),
        currentPeriodEnd: toDate(subscriptionData.current_period_end),
        trialStart: toDate(subscriptionData.trial_start),
        trialEnd: toDate(subscriptionData.trial_end),
        cancelAt: toDate(subscriptionData.cancel_at),
        canceledAt: toDate(subscriptionData.canceled_at),
      },
    })
  }

  async handleSubscriptionDeleted(subscriptionData: Stripe.Subscription) {
    return this.txHost.tx.subscription.update({
      where: { stripeSubscriptionId: subscriptionData.id },
      data: {
        status: 'canceled',
        canceledAt: toDate(subscriptionData.cancel_at),
      },
    })
  }

  async findStripeEventById(eventId: string) {
    return this.txHost.tx.stripeWebhookEvent.findFirst({
      where: {
        eventId: eventId,
      },
      select: {
        id: true,
      },
    })
  }

  async findPaymentCustomerById(userId: number) {
    return this.txHost.tx.paymentCustomer.findUniqueOrThrow({
      where: {
        userId: userId,
      },
      select: {
        userId: true,
        stripeCustomerId: true,
      },
    })
  }

  async findPaymentCustomerByStripeId(stripeCustomerId: string) {
    return this.txHost.tx.paymentCustomer.findUniqueOrThrow({
      where: {
        stripeCustomerId: stripeCustomerId,
      },
      select: {
        id: true,
        userId: true,
        stripeCustomerId: true,
      },
    })
  }

  async findUserSubscriptionStatus(
    userId: number,
    statuses = ['active', 'trialing', 'canceled']
  ) {
    const now = new Date()
    return this.txHost.tx.subscription.findMany({
      where: {
        paymentCustomer: {
          userId: userId,
        },
        status: {
          in: statuses,
        },
        currentPeriodEnd: {
          gt: now, // Only consider subscriptions where the current period hasn't ended
        },
      },
      orderBy: {
        currentPeriodEnd: 'desc', // Order by most recent subscription first
      },
      select: {
        id: true,
        priceId: true,
      },
    })
  }

  async findActiveProductsWithPrices() {
    return this.txHost.tx.product.findMany({
      where: {
        active: true,
      },
      include: {
        prices: true,
      },
    })
  }
}
