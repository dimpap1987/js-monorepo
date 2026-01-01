import { ApiException } from '@js-monorepo/nest/exceptions'
import { tryCatch } from '@js-monorepo/utils/common'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { CreateProductType } from '../../'
import { CreateSubscriptionDto } from '../dto/create-subscription.dto'
import { CreateStripeWebhookEventDto } from '../dto/stripe-event.dto'
import { SubscriptionUpdateData, SubscriptionDeleteData } from '../dto/subscription-webhook.dto'
import { PaymentsRepository } from '../repository/payments.repository'

@Injectable()
export class PaymentsService {
  logger = new Logger(PaymentsService.name)

  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async createSubscription(payload: CreateSubscriptionDto) {
    this.logger.log(
      `Create Subscription for price Id: '${payload.priceId}' and paymentCustomer_id : '${payload.paymentCustomerId}'`
    )
    const { result, error } = await tryCatch(() => this.paymentsRepository.createSubscription(payload))

    if (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_SUBSCRIPTION_CREATION_ERROR')
    }

    this.logger.log(`Subscription created successfully with subscription id: '${result.id}'`)
    return result
  }

  async createProduct(product: CreateProductType) {
    this.logger.log(`Create Product with name: ${product.name}`)
    const { result, error } = await tryCatch(() => this.paymentsRepository.createProduct(product))
    if (error) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CREATE_PAYMENT_CUSTOMER')
    }
    return result
  }

  async createStripeWebhookEvent(event: CreateStripeWebhookEventDto) {
    this.logger.log(`Create Stripe Event with id: '${event.eventId}' and type: '${event.eventType}'`)
    return tryCatch(() => this.paymentsRepository.createStripeWebhookEvent(event))
  }

  async createOrUpdatePaymentCustomer(payload: { stripeCustomerId: string; userId: number }) {
    this.logger.log(`Create Payment customer for user_id: '${payload.userId}'`)
    const { result, error } = await tryCatch(() => this.paymentsRepository.createOrUpdatePaymentCustomer(payload))
    if (error) {
      this.logger.error(`Failed to create Payment customer for user_id: ${payload.userId}`, error.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CREATE_PAYMENT_CUSTOMER')
    }
    return result
  }

  @Transactional()
  async updateSubscription(subscriptionData: SubscriptionUpdateData) {
    this.logger.log(`Update Subscription for with price id: '${subscriptionData.items?.data[0]?.price?.id}'`)
    const price = await this.findPriceByStripeId(subscriptionData.items.data[0].price.id)

    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.handleSubscriptionUpdated(subscriptionData, price.id)
    )

    if (error) {
      this.logger.error(`Error UPDATING subscription with id: ${subscriptionData.id}`, error.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_UPDATE_SUBSCRIPTION')
    }
    return result
  }

  async deleteSubscription(subscriptionData: SubscriptionDeleteData) {
    const { result, error } = await tryCatch(() => this.paymentsRepository.handleSubscriptionDeleted(subscriptionData))

    if (error) {
      this.logger.error(`Error DELETING subscription with id: ${subscriptionData.id}`, error.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_DELETE_SUBSCRIPTION')
    }
    return result
  }

  async findStripeWebhookEvent(eventId: string) {
    this.logger.debug(`Search for Stripe Event with id: '${eventId}'`)
    return tryCatch(() => this.paymentsRepository.findStripeEventById(eventId))
  }

  async findPaymentCustomerById(userId: number) {
    this.logger.debug(`Search for Payment Customer with id: '${userId}'`)
    const { result, error } = await tryCatch(() => this.paymentsRepository.findPaymentCustomerById(userId))
    if (error) {
      this.logger.error(`Payment Customer with id: '${userId}' not found`, error.stack)
    }
    return result
  }

  async findPaymentCustomerByStripeId(stripeCustomerId: string) {
    this.logger.debug(`Search for Payment Customer by stripeCustomerId: '${stripeCustomerId}'`)
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.findPaymentCustomerByStripeId(stripeCustomerId)
    )
    if (error) {
      this.logger.error(`Error Payment Customer NOT FOUND with stripeCustomerId: ${stripeCustomerId}`, error.stack)
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_PAYMENT_CUSTOMER_NOT_FOUND')
    }
    return result
  }

  async findUserSubscriptionStatus(userId: number) {
    const subscriptions = await this.paymentsRepository.findUserSubscriptions(userId)

    if (!subscriptions || subscriptions.length === 0) {
      return {
        isSubscribed: false,
        isTrial: false,
        plan: null,
        subscriptionId: null,
        priceId: null,
        trialEnd: null,
      }
    }

    // Get the most recent active subscription
    const activePlan = subscriptions[0]
    const subscription = await this.findSubscriptionByid(activePlan.id)

    return {
      isSubscribed: true,
      isTrial: subscription.status === 'trialing',
      plan: activePlan.price?.product?.name || null,
      subscriptionId: activePlan.id,
      priceId: activePlan.price?.id || null,
      trialEnd: subscription.trialEnd || null,
    }
  }

  async findActiveProductsWithPrices() {
    const { result, error } = await tryCatch(() => this.paymentsRepository.findActiveProductsWithPrices())
    if (error) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_PRODUCTS')
    }
    return result.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      features: product.features,
      // active: product.active,
      prices: product.prices?.map((prices) => ({
        id: prices.id,
        unitAmount: prices.unitAmount,
        currency: prices.currency,
        interval: prices.interval,
      })),
    }))
  }

  async findPriceByStripeId(stripeId: string) {
    const { result, error } = await tryCatch(() => this.paymentsRepository.findPriceByStripeId(stripeId))
    if (error) {
      this.logger.error(`Error in Searching Price by stripeId: '${stripeId}'`, error.stack)
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_PRICE_BY_STIPE_ID')
    }

    return result
  }

  async findPriceById(priceId: number) {
    const { result, error } = await tryCatch(() => this.paymentsRepository.findPriceById(priceId))
    if (error) {
      this.logger.error(`Error in Finding Price by priceId: '${priceId}'`, error.stack)
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_PRICE_BY_ID')
    }

    return result
  }

  async findSubscriptionByPriceIdAndUserId(priceId: number, userId: number) {
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.findSubscriptionByPriceIdAndUserId(priceId, userId)
    )
    if (error) {
      this.logger.error(`Error in finding Subscription by priceId: '${priceId}' and userId: ${userId}`, error.stack)
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_SUBSCRIPTION_BY_ID_USER_ID')
    }

    return result
  }

  async findSubscriptionByid(id: number) {
    const { result, error } = await tryCatch(() => this.paymentsRepository.findSubscriptionByid(id))
    if (error) {
      this.logger.error(`Error in finding Subscription by id: '${id}'`, error.stack)
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_SUBSCRIPTION_BY_ID_USER_ID')
    }

    return result
  }

  async findSubscriptionByStripeId(stripeSubscriptionId: string) {
    const { result } = await tryCatch(() => this.paymentsRepository.findSubscriptionByStripeId(stripeSubscriptionId))
    return result
  }

  async getActiveSubscriptionByProductAndUserId(userId: number, productName: string) {
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.getActiveSubscriptionByProductAndUserId(userId, productName)
    )
    if (error) {
      this.logger.error(
        `Failed to find active subscription for user with id: ${userId} and product name: ${productName}`,
        error.stack
      )
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_FETCH_ACTIVE_SUBSCRIPTION')
    }
    return result
  }

  async hasActiveSubscription(userId: number, productName: string) {
    const subscription = await this.getActiveSubscriptionByProductAndUserId(userId, productName)

    return !!subscription
  }

  async getHighestActivePlanByUser(userId: number) {
    const { result, error } = await tryCatch(() => this.paymentsRepository.getHighestActivePlanByUser(userId))

    if (error) {
      this.logger.error(`Error getting highest active plan for user: '${userId}'`, error.stack)
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_HIGHEST_ACTIVE_USER_PLAN')
    }

    return result
  }

  async findProductyByName(name: string) {
    const { result, error } = await tryCatch(() => this.paymentsRepository.findProductyByName(name))

    if (error) {
      this.logger.error(`Error getting product with name: '${name}'`, error.stack)
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_PRODUCT_BY_NAME')
    }

    return result
  }

  async findAllSubscriptions(page = 1, pageSize = 10) {
    return this.paymentsRepository.findAllSubscriptions(page, pageSize)
  }

  async findActiveTrialForProduct(userId: number, productId: number) {
    const { result } = await tryCatch(() => this.paymentsRepository.findActiveTrialForProduct(userId, productId))
    return result
  }

  async findActiveTrialForUser(userId: number) {
    const { result } = await tryCatch(() => this.paymentsRepository.findActiveTrialForUser(userId))
    return result
  }

  async cancelTrialSubscription(subscriptionId: number) {
    this.logger.log(`Canceling trial subscription ${subscriptionId} due to paid upgrade`)
    const { result, error } = await tryCatch(() => this.paymentsRepository.cancelTrialSubscription(subscriptionId))
    if (error) {
      this.logger.error(`Error canceling trial: ${error.message}`, error.stack)
    }
    return result
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
    this.logger.log(`Converting trial subscription ${subscriptionId} to paid`)
    const { result, error } = await tryCatch(() => this.paymentsRepository.convertTrialToPaid(subscriptionId, data))

    if (error) {
      this.logger.error(`Error converting trial to paid for subscription: ${subscriptionId}`, error.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CONVERT_TRIAL_TO_PAID')
    }

    return result
  }
}
