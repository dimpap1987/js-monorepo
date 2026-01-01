import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { CreateProductType } from '../../'
import { ACTIVE_SUBSCRIPTION_STATUSES, CancelReason } from '../constants'
import { CreateSubscriptionDto } from '../dto/create-subscription.dto'
import { CreateStripeWebhookEventDto } from '../dto/stripe-event.dto'
import { SubscriptionDeleteData, SubscriptionUpdateData } from '../dto/subscription-webhook.dto'
import { timestampToDate } from '../utils'

@Injectable()
export class PaymentsRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

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
      include: {
        price: {
          select: {
            product: true,
          },
        },
      },
    })
  }

  async createOrUpdatePaymentCustomer(payload: { stripeCustomerId: string; userId: number }) {
    return this.txHost.tx.paymentCustomer.upsert({
      where: { userId: payload.userId },
      create: payload,
      update: { stripeCustomerId: payload.stripeCustomerId },
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

  async handleSubscriptionUpdated(subscriptionData: SubscriptionUpdateData, priceId: number) {
    return this.txHost.tx.subscription.update({
      where: { stripeSubscriptionId: subscriptionData.id },
      data: {
        priceId: priceId,
        status: subscriptionData.status,
        currentPeriodStart: timestampToDate(subscriptionData.current_period_start),
        currentPeriodEnd: timestampToDate(subscriptionData.current_period_end),
        trialStart: timestampToDate(subscriptionData.trial_start),
        trialEnd: timestampToDate(subscriptionData.trial_end),
        cancelAt: timestampToDate(subscriptionData.cancel_at),
        canceledAt: timestampToDate(subscriptionData.canceled_at),
        cancelReason: subscriptionData.cancelReason,
      },
      include: {
        price: {
          select: {
            product: true,
          },
        },
      },
    })
  }

  async handleSubscriptionDeleted(subscriptionData: SubscriptionDeleteData) {
    return this.txHost.tx.subscription.update({
      where: { stripeSubscriptionId: subscriptionData.id },
      data: {
        status: subscriptionData.status,
        canceledAt: timestampToDate(subscriptionData.cancel_at),
        cancelReason: subscriptionData.cancelReason,
      },
      include: {
        price: {
          select: {
            product: true,
          },
        },
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
        id: true,
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

  async findUserSubscriptions(userId: number, statuses: string[] = ACTIVE_SUBSCRIPTION_STATUSES) {
    return this.txHost.tx.subscription.findMany({
      where: {
        paymentCustomer: {
          userId: userId,
        },
        status: {
          in: statuses,
        },
      },
      orderBy: {
        currentPeriodEnd: 'desc', // Order by most recent subscription first
      },
      select: {
        id: true,
        price: {
          select: {
            id: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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

  async findPriceByStripeId(stripeId: string) {
    return this.txHost.tx.price.findUniqueOrThrow({
      where: {
        stripeId: stripeId,
      },
      include: {
        product: true,
      },
    })
  }

  async findPriceById(id: number) {
    return this.txHost.tx.price.findUniqueOrThrow({
      where: {
        id: id,
      },
      include: {
        product: true,
      },
    })
  }

  async findSubscriptionByPriceIdAndUserId(priceId: number, userId: number) {
    const paymentCustomer = await this.findPaymentCustomerById(userId)

    return this.txHost.tx.subscription.findFirstOrThrow({
      where: {
        priceId: priceId,
        paymentCustomerId: paymentCustomer.id,
      },
      orderBy: {
        id: 'desc',
      },
    })
  }

  async findSubscriptionByid(id: number) {
    return this.txHost.tx.subscription.findFirstOrThrow({
      where: {
        id: id,
      },
    })
  }

  async findSubscriptionByStripeId(stripeSubscriptionId: string) {
    return this.txHost.tx.subscription.findFirst({
      where: {
        stripeSubscriptionId,
      },
      select: {
        id: true,
        cancelAt: true,
      },
    })
  }

  async getActiveSubscriptionByProductAndUserId(userId: number, productName: string) {
    return this.txHost.tx.subscription.findFirst({
      where: {
        paymentCustomerId: userId,
        status: 'active',
        currentPeriodEnd: {
          gte: new Date(),
        },
        price: {
          product: {
            name: productName,
          },
        },
      },
      include: {
        price: {
          include: {
            product: true,
          },
        },
      },
    })
  }

  async getHighestActivePlanByUser(userId: number): Promise<number | null> {
    const activeSubscription = await this.txHost.tx.subscription.findFirst({
      where: {
        paymentCustomerId: userId,
        status: 'active',
        currentPeriodEnd: {
          gte: new Date(),
        },
      },
      include: {
        price: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        price: {
          product: {
            hierarchy: 'desc',
          },
        },
      },
    })

    return activeSubscription?.price?.product?.hierarchy || null
  }

  async findProductyByName(name: string) {
    return this.txHost.tx.product.findUnique({
      where: { name: name },
      select: { hierarchy: true, id: true, name: true },
    })
  }

  async hasUsedAnyTrial(userId: number): Promise<boolean> {
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: {
        paymentCustomer: { userId },
        trialStart: { not: null },
      },
    })
    return !!subscription
  }

  async hasActiveTrialSubscription(userId: number): Promise<boolean> {
    const subscription = await this.txHost.tx.subscription.findFirst({
      where: {
        paymentCustomer: { userId },
        status: 'trialing',
        stripeSubscriptionId: null,
        trialEnd: { gt: new Date() },
      },
    })
    return !!subscription
  }

  async findActiveTrialForProduct(userId: number, productId: number) {
    return this.txHost.tx.subscription.findFirst({
      where: {
        paymentCustomer: { userId },
        status: 'trialing',
        stripeSubscriptionId: null,
        price: { productId },
      },
      include: {
        price: { include: { product: true } },
      },
    })
  }

  async findActiveTrialForUser(userId: number) {
    return this.txHost.tx.subscription.findFirst({
      where: {
        paymentCustomer: { userId },
        status: 'trialing',
        stripeSubscriptionId: null,
      },
      include: {
        price: { include: { product: true } },
      },
    })
  }

  async cancelTrialSubscription(subscriptionId: number) {
    return this.txHost.tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
        cancelReason: CancelReason.UPGRADED_TO_PAID,
      },
    })
  }

  async convertTrialToPaid(
    subscriptionId: number,
    data: {
      stripeSubscriptionId: string
      status: string
      currentPeriodStart: Date
      currentPeriodEnd: Date
    }
  ) {
    return this.txHost.tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        stripeSubscriptionId: data.stripeSubscriptionId,
        status: data.status,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        // Keep trialStart/trialEnd as historical record for hasUsedTrialForProduct check
      },
      include: {
        price: { include: { product: true } },
      },
    })
  }

  async findExpiredTrialSubscriptions() {
    return this.txHost.tx.subscription.findMany({
      where: {
        status: 'trialing',
        stripeSubscriptionId: null,
        trialEnd: { lte: new Date() },
      },
      include: {
        paymentCustomer: { include: { authUser: true } },
        price: { include: { product: true } },
      },
    })
  }

  async createLocalTrialSubscription(data: {
    paymentCustomerId: number
    priceId: number
    trialStart: Date
    trialEnd: Date
  }) {
    return this.txHost.tx.subscription.create({
      data: {
        paymentCustomerId: data.paymentCustomerId,
        stripeSubscriptionId: null,
        priceId: data.priceId,
        status: 'trialing',
        currentPeriodStart: data.trialStart,
        currentPeriodEnd: data.trialEnd,
        trialStart: data.trialStart,
        trialEnd: data.trialEnd,
      },
      include: {
        price: { include: { product: true } },
      },
    })
  }

  async expireTrialSubscription(subscriptionId: number) {
    return this.txHost.tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
        cancelReason: 'trial_expired',
      },
      include: {
        paymentCustomer: { include: { authUser: true } },
        price: { include: { product: true } },
      },
    })
  }

  async findAllSubscriptions(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize

    const [subscriptions, totalCount] = await Promise.all([
      this.txHost.tx.subscription.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          stripeSubscriptionId: true,
          status: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAt: true,
          canceledAt: true,
          cancelReason: true,
          createdAt: true,
          price: {
            select: {
              id: true,
              unitAmount: true,
              currency: true,
              interval: true,
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          paymentCustomer: {
            select: {
              stripeCustomerId: true,
              authUser: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.txHost.tx.subscription.count(),
    ])

    return { subscriptions, totalCount }
  }
}
