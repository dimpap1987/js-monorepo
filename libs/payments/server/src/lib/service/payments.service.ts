import { ApiException } from '@js-monorepo/nest/exceptions'
import { tryCatch } from '@js-monorepo/utils/common'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { CreateProductType } from '../../'
import { CreateSubscriptionDto } from '../dto/create-subscription.dto'
import { CreateStripeWebhookEventDto } from '../dto/stripe-event.dto'
import { PaymentsRepository } from '../repository/payments.repository'

@Injectable()
export class PaymentsService {
  logger = new Logger(PaymentsService.name)

  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async createSubscription(payload: CreateSubscriptionDto) {
    this.logger.debug(
      `Create Subscription for price Id: '${payload.priceId}' and paymentCustomer_id : '${payload.paymentCustomerId}'`
    )
    const { result, error } = await tryCatch(() => this.paymentsRepository.createSubscription(payload))

    if (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_SUBSCRIPTION_CREATION_ERROR')
    }

    this.logger.log(`Subscription created successfully with subscription id: '${result.id}'`)
    return result
  }

  async createProduct(product: CreateProductType) {
    this.logger.debug(`Create Product with name: ${product.name}`)
    const { result, error } = await tryCatch(() => this.paymentsRepository.createProduct(product))
    if (error) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CREATE_PAYMENT_CUSTOMER')
    }
    return result
  }

  async createStripeWebhookEvent(event: CreateStripeWebhookEventDto) {
    this.logger.debug(`Create Stripe Event with id: '${event.eventId}' and type: '${event.eventType}'`)
    return tryCatch(() => this.paymentsRepository.createStripeWebhookEvent(event))
  }

  async createOrUpdatePaymentCustomer(payload: { stripeCustomerId: string; userId: number }) {
    this.logger.debug(`Create Payment customer for user_id: '${payload.userId}'`)
    const { result, error } = await tryCatch(() => this.paymentsRepository.createOrUpdatePaymentCustomer(payload))
    if (error) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CREATE_PAYMENT_CUSTOMER')
    }
    return result
  }

  @Transactional()
  async updateSubscription(subscriptionData: Stripe.Subscription) {
    const price = await this.findPriceByStripeId(subscriptionData.items.data[0]?.price.id)

    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.handleSubscriptionUpdated(subscriptionData, price.id)
    )

    if (error) {
      this.logger.error(`Error UPDATING subscription with id: ${subscriptionData.id}`)
    }
    return result
  }

  async deleteSubscription(subscriptionData: Stripe.Subscription) {
    const { result, error } = await tryCatch(() => this.paymentsRepository.handleSubscriptionDeleted(subscriptionData))

    if (error) {
      this.logger.error(`Error DELETING subscription with id: ${subscriptionData.id}`)
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
      this.logger.log(`Payment Customer with id: '${userId}' not found`)
    }
    return result
  }

  async findPaymentCustomerByStripeId(stripeCustomerId: string) {
    this.logger.debug(`Search for Payment Customer by stripeCustomerId: '${stripeCustomerId}'`)
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.findPaymentCustomerByStripeId(stripeCustomerId)
    )
    if (error) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_PAYMENT_CUSTOMER_NOT_FOUND')
    }
    return result
  }

  async findUserSubscriptionStatus(userId: number) {
    const subscriptions = await this.paymentsRepository.findUserSubscriptions(userId)

    if (!subscriptions || subscriptions.length === 0) {
      return {
        isSubscribed: false,
      }
    }

    return {
      isSubscribed: true,
      plans: subscriptions.map((subscription) => ({
        subscriptionId: subscription.id,
        price: { ...subscription.price },
      })),
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
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_PRICE_BY_STIPE_ID')
    }

    return result
  }

  async findPriceById(priceId: number) {
    const { result, error } = await tryCatch(() => this.paymentsRepository.findPriceById(priceId))
    if (error) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_PRICE_BY_ID')
    }

    return result
  }

  async findSubscriptionByPriceIdAndUserId(priceId: number, userId: number) {
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.findSubscriptionByPriceIdAndUserId(priceId, userId)
    )
    if (error) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_SUBSCRIPTION_BY_ID_USER_ID')
    }

    return result
  }

  async findSubscriptionByid(id: number) {
    const { result, error } = await tryCatch(() => this.paymentsRepository.findSubscriptionByid(id))
    if (error) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_SUBSCRIPTION_BY_ID_USER_ID')
    }

    return result
  }

  async getActiveSubscriptionByProductAndUserId(userId: number, productName: string) {
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.getActiveSubscriptionByProductAndUserId(userId, productName)
    )
    if (error) {
      this.logger.error(
        `Failed to find active subscription for user with id: ${userId} and product name: ${productName}`
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
      this.logger.error(`Error getting highest active plan for user: '${userId}'`)
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_HIGHEST_ACTIVE_USER_PLAN')
    }

    return result
  }

  async findProductyByName(name: string) {
    const { result, error } = await tryCatch(() => this.paymentsRepository.findProductyByName(name))

    if (error) {
      this.logger.error(`Error getting product with name: '${name}'`)
      throw new ApiException(HttpStatus.NOT_FOUND, 'ERROR_FETCH_PRODUCT_BY_NAME')
    }

    return result
  }
}
