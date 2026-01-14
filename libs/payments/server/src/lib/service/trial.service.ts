import { ApiException } from '@js-monorepo/nest/exceptions'
import { SubscriptionStatus, CancelReason } from '@js-monorepo/types/subscription'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { PaymentsModuleOptions } from '../../'
import { TRIAL_DURATION_DAYS } from '../constants'
import { AssignTrialDto, DeactivateTrialDto, ExtendTrialDto } from '../dto/admin-trial.dto'
import { StartTrialResponse, TrialEligibilityResponse } from '../dto/start-trial.dto'
import { PaymentsRepository } from '../repository/payments.repository'
import { PaymentsService } from './payments.service'
import { StripeService } from './stripe.service'

@Injectable()
export class TrialService {
  private readonly logger = new Logger(TrialService.name)

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
    @Inject('PAYMENTS_OPTIONS')
    private readonly paymentsModuleOptions: PaymentsModuleOptions
  ) {}

  async checkTrialEligibility(userId: number, priceId: number): Promise<TrialEligibilityResponse> {
    const price = await this.paymentsService.findPriceById(priceId)
    const product = price.product

    // Check if user has ever used any trial - one trial per user lifetime
    const hasUsedTrial = await this.paymentsRepository.hasUsedAnyTrial(userId)
    if (hasUsedTrial) {
      return {
        eligible: false,
        reason: 'You have already used your free trial',
        trialDurationDays: TRIAL_DURATION_DAYS,
        productName: product.name,
      }
    }

    // Check if user has a paid subscription at same or higher level
    const paymentCustomer = await this.paymentsService.findPaymentCustomerById(userId)
    if (paymentCustomer) {
      const currentHierarchy = await this.paymentsRepository.getHighestActivePlanByUser(paymentCustomer.id)

      if (currentHierarchy !== null && currentHierarchy >= product.hierarchy) {
        return {
          eligible: false,
          reason: 'You can only trial plans higher than your current plan',
          trialDurationDays: TRIAL_DURATION_DAYS,
          productName: product.name,
        }
      }
    }

    return {
      eligible: true,
      trialDurationDays: TRIAL_DURATION_DAYS,
      productName: product.name,
    }
  }

  async startTrial(userId: number, email: string, priceId: number): Promise<StartTrialResponse> {
    const result = await this.createTrialSubscription(userId, email, priceId)

    // Call callback AFTER transaction commits to avoid "Transaction already closed" error
    this.paymentsModuleOptions.onTrialStarted?.(userId, {
      id: result.subscriptionId,
      name: result.productName,
    })

    return result
  }

  @Transactional()
  private async createTrialSubscription(userId: number, email: string, priceId: number): Promise<StartTrialResponse> {
    const eligibility = await this.checkTrialEligibility(userId, priceId)

    if (!eligibility.eligible) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'TRIAL_NOT_ELIGIBLE', eligibility.reason)
    }

    const price = await this.paymentsService.findPriceById(priceId)

    const paymentCustomerId = await this.getOrCreatePaymentCustomer(userId, email)

    const trialStart = new Date()
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS)

    const subscription = await this.paymentsRepository.createLocalTrialSubscription({
      paymentCustomerId,
      priceId: price.id,
      trialStart,
      trialEnd,
    })

    this.logger.log(`Trial started for user ${userId} on product ${price.product.name}, ends ${trialEnd.toISOString()}`)

    return {
      subscriptionId: subscription.id,
      trialEnd,
      productName: price.product.name,
      message: `Your ${TRIAL_DURATION_DAYS}-day free trial has started`,
    }
  }

  async processExpiredTrials(): Promise<{ processed: number }> {
    const expiredTrials = await this.paymentsRepository.findExpiredTrialSubscriptions()

    this.logger.log(`Processing ${expiredTrials.length} expired trials`)

    let processed = 0

    for (const subscription of expiredTrials) {
      try {
        const expiredSub = await this.paymentsRepository.expireTrialSubscription(subscription.id)

        this.logger.log(
          `Trial expired for subscription ${subscription.id}, user ${subscription.paymentCustomer.userId}`
        )

        this.paymentsModuleOptions.onTrialExpired?.(subscription.paymentCustomer.userId, {
          id: expiredSub.id,
          name: expiredSub.price.product.name,
        })

        processed++
      } catch (error) {
        this.logger.error(`Failed to process expired trial ${subscription.id}`, error)
      }
    }

    return { processed }
  }

  private async getOrCreatePaymentCustomer(userId: number, email: string): Promise<number> {
    const existingCustomer = await this.paymentsService.findPaymentCustomerById(userId)

    if (existingCustomer) {
      return existingCustomer.id
    }

    const stripeCustomer = await this.stripeService.createCustomerIfNotExists(email)

    const paymentCustomer = await this.paymentsService.createOrUpdatePaymentCustomer({
      userId,
      stripeCustomerId: stripeCustomer.id,
    })

    return paymentCustomer.id
  }

  // ============= Admin Methods =============

  @Transactional()
  async assignTrialAdmin(dto: AssignTrialDto) {
    // Get user email from authUser
    const authUser = await this.paymentsRepository.findAuthUserById(dto.userId)
    if (!authUser) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'USER_NOT_FOUND', 'User not found')
    }

    // Validate price exists
    const price = await this.paymentsService.findPriceById(dto.priceId)

    // Get or create payment customer
    const paymentCustomerId = await this.getOrCreatePaymentCustomer(dto.userId, authUser.email)

    // Find only active local trials (not paid subscriptions)
    // We respect paid subscriptions - only cancel existing trials before assigning a new one
    const activeTrials = await this.paymentsRepository.findActiveTrialsByUserId(dto.userId)

    // Cancel existing active trials before creating new one
    // Note: We don't cancel paid subscriptions - if user has paid, we respect that
    if (activeTrials.length > 0) {
      await this.paymentsRepository.cancelActiveTrialsForUser(dto.userId, CancelReason.ADMIN_REPLACED)
      this.logger.log(
        `Canceled ${activeTrials.length} active trial(s) for user ${dto.userId} before assigning new trial`
      )
    }

    // Create trial subscription
    const trialStart = new Date()
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + dto.trialDurationDays)

    const subscription = await this.paymentsRepository.createLocalTrialSubscription({
      paymentCustomerId,
      priceId: price.id,
      trialStart,
      trialEnd,
    })

    this.logger.log(
      `Admin assigned ${dto.trialDurationDays}-day trial to user ${dto.userId} for product ${price.product.name}, ends ${trialEnd.toISOString()}`
    )

    // Call callback AFTER transaction commits
    this.paymentsModuleOptions.onTrialStarted?.(dto.userId, {
      id: subscription.id,
      name: price.product.name,
    })

    return {
      subscriptionId: subscription.id,
      trialEnd,
      productName: price.product.name,
      message: `Trial assigned successfully. Ends ${trialEnd.toISOString()}`,
      canceledPreviousTrials: activeTrials.length,
    }
  }

  @Transactional()
  async extendTrialAdmin(subscriptionId: number, dto: ExtendTrialDto) {
    const subscription = await this.paymentsRepository.findTrialSubscriptionById(subscriptionId)

    if (!subscription) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'TRIAL_SUBSCRIPTION_NOT_FOUND', 'Trial subscription not found')
    }

    if (subscription.status !== SubscriptionStatus.TRIALING) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'NOT_TRIAL_SUBSCRIPTION', 'Subscription is not in trialing status')
    }

    const extendedTrial = await this.paymentsRepository.extendTrialSubscription(subscriptionId, dto.additionalDays)

    this.logger.log(
      `Admin extended trial ${subscriptionId} by ${dto.additionalDays} days. New end date: ${extendedTrial.trialEnd.toISOString()}`
    )

    return extendedTrial
  }

  @Transactional()
  async deactivateTrialAdmin(subscriptionId: number, dto?: DeactivateTrialDto) {
    const subscription = await this.paymentsRepository.findTrialSubscriptionById(subscriptionId)

    if (!subscription) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'TRIAL_SUBSCRIPTION_NOT_FOUND', 'Trial subscription not found')
    }

    if (subscription.status !== SubscriptionStatus.TRIALING) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'NOT_TRIAL_SUBSCRIPTION', 'Subscription is not in trialing status')
    }

    const deactivatedTrial = await this.paymentsRepository.deactivateTrialSubscription(subscriptionId, dto?.reason)

    this.logger.log(
      `Admin deactivated trial ${subscriptionId} for user ${subscription.paymentCustomer.userId}. Reason: ${dto?.reason || CancelReason.ADMIN_DEACTIVATED}`
    )

    return deactivatedTrial
  }
}
