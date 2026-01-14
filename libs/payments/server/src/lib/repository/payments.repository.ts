import { PaginationType } from '@js-monorepo/types/pagination'
import {
  Subscription,
  SubscriptionStatus,
  CancelReason,
  ACTIVE_SUBSCRIPTION_STATUSES,
} from '@js-monorepo/types/subscription'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { CreateProductType } from '../../'
import {
  AdminProductResponse,
  CreatePriceDto,
  CreateProductDto,
  ProductFiltersDto,
  UpdatePriceDto,
  UpdateProductDto,
} from '../dto/admin-product.dto'
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
        metadata: payload.metadata,
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
        // Since trial is handled internally
        // trialStart: timestampToDate(subscriptionData.trial_start),
        // trialEnd: timestampToDate(subscriptionData.trial_end),
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

  async findAuthUserById(userId: number) {
    return this.txHost.tx.authUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
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

  async hasUserSubscriptionHistory(userId: number): Promise<boolean> {
    const paymentCustomer = await this.txHost.tx.paymentCustomer.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
      },
    })

    if (!paymentCustomer) {
      return false
    }

    const count = await this.txHost.tx.subscription.count({
      where: {
        paymentCustomerId: paymentCustomer.id,
      },
    })

    return count > 0
  }

  async findActiveProductsWithPrices() {
    return this.txHost.tx.product.findMany({
      where: {
        active: true,
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        prices: {
          where: { status: SubscriptionStatus.ACTIVE }, // Public endpoint: only show active prices
          orderBy: { interval: 'asc' },
        },
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
      include: {
        price: {
          include: {
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

  async getActiveSubscriptionsByUserOrderedByHierarchy(userId: number) {
    // Get all active subscriptions/trials ordered by hierarchy (highest first)
    // This includes both 'active' (paid) and 'trialing' (local trials) statuses
    return this.txHost.tx.subscription.findMany({
      where: {
        paymentCustomer: { userId },
        status: {
          in: ACTIVE_SUBSCRIPTION_STATUSES,
        },
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
            hierarchy: 'desc', // Highest hierarchy first
          },
        },
      },
    })
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
        status: SubscriptionStatus.TRIALING,
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
        status: SubscriptionStatus.TRIALING,
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
        status: SubscriptionStatus.TRIALING,
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
        status: SubscriptionStatus.CANCELED,
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
        status: SubscriptionStatus.TRIALING,
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
        status: SubscriptionStatus.TRIALING,
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
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
        cancelReason: CancelReason.TRIAL_EXPIRED,
      },
      include: {
        paymentCustomer: { include: { authUser: true } },
        price: { include: { product: true } },
      },
    })
  }

  async extendTrialSubscription(subscriptionId: number, additionalDays: number) {
    const subscription = await this.txHost.tx.subscription.findUniqueOrThrow({
      where: { id: subscriptionId },
      select: { trialEnd: true },
    })

    const newTrialEnd = new Date(subscription.trialEnd)
    newTrialEnd.setDate(newTrialEnd.getDate() + additionalDays)

    return this.txHost.tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        trialEnd: newTrialEnd,
        currentPeriodEnd: newTrialEnd, // Update current period end to match trial end
      },
      include: {
        paymentCustomer: { include: { authUser: true } },
        price: { include: { product: true } },
      },
    })
  }

  async deactivateTrialSubscription(subscriptionId: number, reason?: string) {
    return this.txHost.tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
        cancelReason: reason || CancelReason.ADMIN_DEACTIVATED,
      },
      include: {
        paymentCustomer: { include: { authUser: true } },
        price: { include: { product: true } },
      },
    })
  }

  async findTrialSubscriptionById(subscriptionId: number) {
    return this.txHost.tx.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        paymentCustomer: { include: { authUser: true } },
        price: { include: { product: true } },
      },
    })
  }

  async findActiveSubscriptionsByUserId(userId: number) {
    return this.txHost.tx.subscription.findMany({
      where: {
        paymentCustomer: { userId },
        status: {
          in: ACTIVE_SUBSCRIPTION_STATUSES,
        },
      },
      include: {
        paymentCustomer: { include: { authUser: true } },
        price: { include: { product: true } },
      },
    })
  }

  async findActiveTrialsByUserId(userId: number) {
    return this.txHost.tx.subscription.findMany({
      where: {
        paymentCustomer: { userId },
        status: SubscriptionStatus.TRIALING,
        stripeSubscriptionId: null, // Only local trials
      },
      include: {
        paymentCustomer: { include: { authUser: true } },
        price: { include: { product: true } },
      },
    })
  }

  async cancelActiveSubscriptionsForUser(userId: number, reason = CancelReason.ADMIN_REPLACED) {
    return this.txHost.tx.subscription.updateMany({
      where: {
        paymentCustomer: { userId },
        status: {
          in: ACTIVE_SUBSCRIPTION_STATUSES,
        },
      },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
        cancelReason: reason,
      },
    })
  }

  async cancelActiveTrialsForUser(userId: number, reason = CancelReason.ADMIN_REPLACED) {
    return this.txHost.tx.subscription.updateMany({
      where: {
        paymentCustomer: { userId },
        status: SubscriptionStatus.TRIALING,
        stripeSubscriptionId: null, // Only local trials
      },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
        cancelReason: reason,
      },
    })
  }

  async findAllSubscriptions(
    page = 1,
    pageSize = 10,
    filters?: { status?: string; search?: string; plan?: string }
  ): Promise<PaginationType<Subscription>> {
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.plan) {
      where.price = { product: { name: filters.plan } }
    }

    if (filters?.search) {
      where.paymentCustomer = {
        authUser: {
          OR: [
            { email: { contains: filters.search, mode: 'insensitive' } },
            { username: { contains: filters.search, mode: 'insensitive' } },
          ],
        },
      }
    }

    const [content, totalCount] = await Promise.all([
      this.txHost.tx.subscription.findMany({
        where,
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
          trialStart: true,
          trialEnd: true,
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
                  userProfiles: {
                    select: {
                      profileImage: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.txHost.tx.subscription.count({ where }),
    ])

    return {
      content,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    }
  }

  async getSubscriptionStats() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [activeCount, trialingCount, churnedThisMonth, allActiveSubscriptions] = await Promise.all([
      // Active subscriptions
      this.txHost.tx.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      // Active trials
      this.txHost.tx.subscription.count({
        where: { status: SubscriptionStatus.TRIALING },
      }),
      // Churned this month
      this.txHost.tx.subscription.count({
        where: {
          status: SubscriptionStatus.CANCELED,
          canceledAt: { gte: startOfMonth },
        },
      }),
      // All active subscriptions for MRR calculation
      this.txHost.tx.subscription.findMany({
        where: { status: SubscriptionStatus.ACTIVE },
        select: {
          price: {
            select: {
              unitAmount: true,
              interval: true,
            },
          },
        },
      }),
    ])

    // Calculate MRR (convert yearly to monthly)
    const mrr = allActiveSubscriptions.reduce((total, sub) => {
      const amount = sub.price.unitAmount
      if (sub.price.interval === 'year') {
        return total + amount / 12
      }
      return total + amount
    }, 0)

    return {
      activeCount,
      trialingCount,
      churnedThisMonth,
      mrr: Math.round(mrr), // in cents
    }
  }

  // ============= Admin Product Management =============

  async findAllProductsAdmin(
    page = 1,
    pageSize = 10,
    filters?: ProductFiltersDto
  ): Promise<PaginationType<AdminProductResponse>> {
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = {}

    if (filters?.active !== undefined) {
      where.active = filters.active
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [content, totalCount] = await Promise.all([
      this.txHost.tx.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { hierarchy: 'asc' },
        include: {
          prices: {
            orderBy: [{ status: 'asc' }, { interval: 'asc' }], // Show all prices, active first
          },
        },
      }),
      this.txHost.tx.product.count({ where }),
    ])

    return {
      content: content as AdminProductResponse[],
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    }
  }

  async findProductByIdAdmin(id: number): Promise<AdminProductResponse | null> {
    const product = await this.txHost.tx.product.findUnique({
      where: { id },
      include: {
        prices: {
          orderBy: [{ status: 'asc' }, { interval: 'asc' }], // Show all prices, active first
        },
      },
    })
    return product as AdminProductResponse | null
  }

  async createProductLocal(dto: CreateProductDto): Promise<AdminProductResponse> {
    const localStripeId = `local_${Date.now()}`

    const product = await this.txHost.tx.product.create({
      data: {
        stripeId: localStripeId,
        name: dto.name,
        description: dto.description,
        metadata: dto.metadata || {},
        hierarchy: dto.hierarchy ?? 0,
        active: dto.active ?? true,
      },
      include: { prices: true },
    })

    return product as AdminProductResponse
  }

  async updateProductAdmin(id: number, dto: UpdateProductDto): Promise<AdminProductResponse> {
    const product = await this.txHost.tx.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata }),
        ...(dto.hierarchy !== undefined && { hierarchy: dto.hierarchy }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
      include: {
        prices: {
          orderBy: [{ status: 'asc' }, { interval: 'asc' }], // Show all prices, active first
        },
      },
    })

    return product as AdminProductResponse
  }

  async deleteProductAdmin(id: number): Promise<void> {
    await this.txHost.tx.product.delete({ where: { id } })
  }

  async updateProductStripeId(id: number, stripeId: string): Promise<AdminProductResponse> {
    const product = await this.txHost.tx.product.update({
      where: { id },
      data: { stripeId },
      include: {
        prices: {
          orderBy: [{ status: 'asc' }, { interval: 'asc' }], // Show all prices, active first
        },
      },
    })

    return product as AdminProductResponse
  }

  async canDeleteProduct(productId: number): Promise<boolean> {
    const subscriptionCount = await this.txHost.tx.subscription.count({
      where: { price: { productId } },
    })
    return subscriptionCount === 0
  }

  async getProductStats() {
    const [totalProducts, activeProducts, allProducts] = await Promise.all([
      this.txHost.tx.product.count(),
      this.txHost.tx.product.count({ where: { active: true } }),
      this.txHost.tx.product.findMany({ select: { stripeId: true } }),
    ])

    const syncedProducts = allProducts.filter((p) => !p.stripeId.startsWith('local_')).length
    const localOnlyProducts = totalProducts - syncedProducts

    return {
      totalProducts,
      activeProducts,
      syncedProducts,
      localOnlyProducts,
    }
  }

  // ============= Admin Price Management =============

  async findPricesByProductAdmin(productId?: number) {
    const where = productId ? { productId } : {}

    return this.txHost.tx.price.findMany({
      where,
      orderBy: [{ productId: 'asc' }, { status: 'asc' }, { interval: 'asc' }],
      include: { product: { select: { id: true, name: true } } },
    })
  }

  async findPriceByIdAdmin(id: number) {
    return this.txHost.tx.price.findUnique({
      where: { id },
      include: { product: { select: { id: true, name: true } } },
    })
  }

  async createPriceLocal(dto: CreatePriceDto) {
    const localStripeId = `local_price_${Date.now()}`

    return this.txHost.tx.price.create({
      data: {
        stripeId: localStripeId,
        productId: dto.productId,
        unitAmount: dto.unitAmount,
        currency: dto.currency.toLowerCase(),
        interval: dto.interval,
        active: dto.active ?? true,
        status: 'active',
      },
      include: { product: { select: { id: true, name: true } } },
    })
  }

  async createReplacementPrice(
    oldPriceId: number,
    dto: { unitAmount: number; currency: string; interval: string; active?: boolean }
  ) {
    const oldPrice = await this.txHost.tx.price.findUniqueOrThrow({
      where: { id: oldPriceId },
      select: { productId: true },
    })

    const localStripeId = `local_price_${Date.now()}`

    // Create new price record
    const newPrice = await this.txHost.tx.price.create({
      data: {
        stripeId: localStripeId,
        productId: oldPrice.productId,
        unitAmount: dto.unitAmount,
        currency: dto.currency.toLowerCase(),
        interval: dto.interval,
        active: dto.active ?? true,
        status: 'active',
      },
      include: { product: { select: { id: true, name: true } } },
    })

    // Mark old price as legacy and link to new price
    await this.txHost.tx.price.update({
      where: { id: oldPriceId },
      data: {
        status: 'legacy',
        replacedByPriceId: newPrice.id,
      },
    })

    return newPrice
  }

  async updatePriceAdmin(id: number, dto: UpdatePriceDto) {
    return this.txHost.tx.price.update({
      where: { id },
      data: {
        ...(dto.unitAmount !== undefined && { unitAmount: dto.unitAmount }),
        ...(dto.currency !== undefined && { currency: dto.currency.toLowerCase() }),
        ...(dto.interval !== undefined && { interval: dto.interval }),
        ...(dto.active !== undefined && { active: dto.active }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: { product: { select: { id: true, name: true } } },
    })
  }

  async deletePriceAdmin(id: number): Promise<void> {
    await this.txHost.tx.price.delete({ where: { id } })
  }

  async updatePriceStripeId(id: number, stripeId: string) {
    return this.txHost.tx.price.update({
      where: { id },
      data: { stripeId },
      include: { product: { select: { id: true, name: true } } },
    })
  }

  async canDeletePrice(priceId: number): Promise<boolean> {
    const subscriptionCount = await this.txHost.tx.subscription.count({
      where: { priceId },
    })
    return subscriptionCount === 0
  }

  async getPriceSubscriptionCount(priceId: number): Promise<number> {
    return this.txHost.tx.subscription.count({
      where: {
        priceId,
        status: {
          in: ACTIVE_SUBSCRIPTION_STATUSES,
        },
      },
    })
  }

  async updatePriceStatus(priceId: number, status: string, replacedByPriceId?: number) {
    return this.txHost.tx.price.update({
      where: { id: priceId },
      data: {
        status,
        ...(replacedByPriceId !== undefined && { replacedByPriceId }),
      },
    })
  }

  // ============= Reconciliation Methods =============

  async findAllProductsForReconciliation(): Promise<AdminProductResponse[]> {
    const products = await this.txHost.tx.product.findMany({
      include: {
        prices: {
          orderBy: [{ status: 'asc' }, { interval: 'asc' }], // Show all prices, active first
        },
      },
      orderBy: { id: 'asc' },
    })
    return products as AdminProductResponse[]
  }

  async findAllPricesForReconciliation() {
    return this.txHost.tx.price.findMany({
      include: { product: { select: { id: true, name: true, stripeId: true } } },
      orderBy: { id: 'asc' },
    })
  }

  async findProductByStripeId(stripeId: string): Promise<AdminProductResponse | null> {
    const product = await this.txHost.tx.product.findUnique({
      where: { stripeId },
      include: {
        prices: {
          orderBy: [{ status: 'asc' }, { interval: 'asc' }], // Show all prices, active first
        },
      },
    })
    return product as AdminProductResponse | null
  }

  async findPriceByStripeIdAdmin(stripeId: string) {
    return this.txHost.tx.price.findUnique({
      where: { stripeId },
      include: { product: { select: { id: true, name: true, stripeId: true } } },
    })
  }

  async createProductFromStripe(data: {
    stripeId: string
    name: string
    description: string
    active: boolean
    metadata: Record<string, unknown>
  }): Promise<AdminProductResponse> {
    const product = await this.txHost.tx.product.create({
      data: {
        stripeId: data.stripeId,
        name: data.name,
        description: data.description,
        active: data.active,
        metadata: data.metadata,
        hierarchy: 0, // Default hierarchy for imported products
      },
      include: { prices: true },
    })
    return product as AdminProductResponse
  }

  async createPriceFromStripe(data: {
    stripeId: string
    productId: number
    unitAmount: number
    currency: string
    interval: string
    active: boolean
  }) {
    return this.txHost.tx.price.create({
      data: {
        ...data,
        status: 'active',
      },
      include: { product: { select: { id: true, name: true, stripeId: true } } },
    })
  }

  async updateProductFromStripe(
    id: number,
    data: {
      name?: string
      description?: string
      active?: boolean
      metadata?: Record<string, unknown>
    }
  ): Promise<AdminProductResponse> {
    const product = await this.txHost.tx.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.metadata !== undefined && { metadata: data.metadata }),
      },
      include: {
        prices: {
          orderBy: [{ status: 'asc' }, { interval: 'asc' }], // Show all prices, active first
        },
      },
    })
    return product as AdminProductResponse
  }

  async updatePriceFromStripe(
    id: number,
    data: {
      unitAmount?: number
      currency?: string
      interval?: string
      active?: boolean
    }
  ) {
    return this.txHost.tx.price.update({
      where: { id },
      data: {
        ...(data.unitAmount !== undefined && { unitAmount: data.unitAmount }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.interval !== undefined && { interval: data.interval }),
        ...(data.active !== undefined && { active: data.active }),
      },
      include: { product: { select: { id: true, name: true, stripeId: true } } },
    })
  }

  async unlinkProductFromStripe(id: number): Promise<AdminProductResponse> {
    const localStripeId = `local_${Date.now()}`
    const product = await this.txHost.tx.product.update({
      where: { id },
      data: { stripeId: localStripeId },
      include: {
        prices: {
          orderBy: [{ status: 'asc' }, { interval: 'asc' }], // Show all prices, active first
        },
      },
    })
    return product as AdminProductResponse
  }

  async unlinkPriceFromStripe(id: number) {
    const localStripeId = `local_price_${Date.now()}`
    return this.txHost.tx.price.update({
      where: { id },
      data: { stripeId: localStripeId },
      include: { product: { select: { id: true, name: true, stripeId: true } } },
    })
  }
}
