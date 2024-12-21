import { ApiException } from '@js-monorepo/nest/exceptions'
import { tryCatch } from '@js-monorepo/utils/common'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { CreatePlanDto } from '../dto/create-plan.dto'
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
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.createSubscription(payload)
    )

    if (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`)
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'SUBSCRIPTION_CREATION_ERROR'
      )
    }

    this.logger.log(
      `Subscription created successfully with subscription id: '${result.id}'`
    )
    return result
  }

  async createPlan(plan: CreatePlanDto) {
    this.logger.debug(`Create Plan for plan name: ${plan.name}`)
    return tryCatch(() => this.paymentsRepository.createPlan(plan))
  }

  async createStripeWebhookEvent(event: CreateStripeWebhookEventDto) {
    this.logger.debug(
      `Create Stripe Event with id: '${event.eventId}' and type: '${event.eventType}'`
    )
    return tryCatch(() =>
      this.paymentsRepository.createStripeWebhookEvent(event)
    )
  }

  async createPaymentCustomer(payload: {
    stripeCustomerId: string
    userId: number
  }) {
    this.logger.debug(
      `Create Payment customer for user_id: '${payload.userId}'`
    )
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.createPaymentCustomer(payload)
    )
    if (error) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'CREATE_PAYMENT_CUSTOMER')
    }
    return result
  }

  async updateSubscription(subscriptionData: Stripe.Subscription) {
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.handleSubscriptionUpdated(subscriptionData)
    )

    if (error) {
      this.logger.error(
        `Error UPDATING subscription with id: ${subscriptionData.id}`
      )
    }
    return result
  }

  async deleteSubscription(subscriptionData: Stripe.Subscription) {
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.handleSubscriptionDeleted(subscriptionData)
    )

    if (error) {
      this.logger.error(
        `Error DELETING subscription with id: ${subscriptionData.id}`
      )
    }
    return result
  }

  async findStripeWebhookEvent(eventId: string) {
    this.logger.debug(`Search for Stripe Event with id: '${eventId}'`)
    return tryCatch(() => this.paymentsRepository.findStripeEventById(eventId))
  }

  async findPaymentCustomerById(userId: number) {
    this.logger.debug(`Search for Payment Customer with id: '${userId}'`)
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.findPaymentCustomerById(userId)
    )
    if (error) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PAYMENT_CUSTOMER_NOT_FOUND')
    }
    return result
  }

  async findPaymentCustomerByStripeId(stripeCustomerId: string) {
    this.logger.debug(
      `Search for Payment Customer by stripeCustomerId: '${stripeCustomerId}'`
    )
    const { result, error } = await tryCatch(() =>
      this.paymentsRepository.findPaymentCustomerByStripeId(stripeCustomerId)
    )
    if (error) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'PAYMENT_CUSTOMER_NOT_FOUND')
    }
    return result
  }

  async findUserSubscriptionStatus(paymentCustomerId: number) {
    const subscriptions =
      await this.paymentsRepository.findUserSubscriptionStatus(
        paymentCustomerId
      )

    if (!subscriptions || subscriptions.length === 0) {
      return {
        isSubscribed: false,
        plan: null,
      }
    }

    // Return the user as subscribed and provide the relevant plan(s)
    return {
      isSubscribed: true,
      plans: subscriptions.map((subscription) => ({
        id: subscription.id, //TODO replace with plan id when plan will be created
        priceId: subscription.priceId,
      })), // Return all valid plans
    }
  }
}
