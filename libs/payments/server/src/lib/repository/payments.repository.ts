import { toDate } from '@js-monorepo/auth/nest/common/utils'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { CreateProductType } from '../../'
import { CreateSubscriptionDto } from '../dto/create-subscription.dto'
import { CreateStripeWebhookEventDto } from '../dto/stripe-event.dto'
import { SubscriptionUpdateData, SubscriptionDeleteData } from '../dto/subscription-webhook.dto'

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
        currentPeriodStart: toDate(subscriptionData.current_period_start),
        currentPeriodEnd: toDate(subscriptionData.current_period_end),
        trialStart: subscriptionData.trial_start ? toDate(subscriptionData.trial_start) : undefined,
        trialEnd: subscriptionData.trial_end ? toDate(subscriptionData.trial_end) : undefined,
        cancelAt: subscriptionData.cancel_at ? toDate(subscriptionData.cancel_at) : undefined,
        canceledAt: subscriptionData.canceled_at ? toDate(subscriptionData.canceled_at) : undefined,
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
        canceledAt: subscriptionData.cancel_at ? toDate(subscriptionData.cancel_at) : undefined,
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

  async findUserSubscriptions(userId: number, statuses = ['active', 'trialing']) {
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
    })
  }

  async findPriceById(id: number) {
    return this.txHost.tx.price.findUniqueOrThrow({
      where: {
        id: id,
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
}
