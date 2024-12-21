import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { CreateSubscriptionDto } from '../dto/create-subscription.dto'
import { CreateStripeWebhookEventDto } from '../dto/stripe-event.dto'
import { Injectable } from '@nestjs/common'
import { CreatePlanDto } from '../dto/create-plan.dto'
import Stripe from 'stripe'
import { toDate } from '@js-monorepo/auth/nest/common/utils'

@Injectable()
export class PaymentsRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>
  ) {}

  async createPlan(payload: CreatePlanDto) {
    return this.txHost.tx.plan.create({
      data: payload,
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
        userId: true,
        stripeCustomerId: true,
      },
    })
  }

  async findUserSubscriptionStatus(
    paymentCustomerId: number,
    statuses = ['active', 'trialing']
  ) {
    return this.txHost.tx.subscription.findFirst({
      where: {
        paymentCustomerId,
        status: {
          in: statuses,
        },
      },
    })
  }
}
