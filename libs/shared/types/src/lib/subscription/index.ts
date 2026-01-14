/**
 * Subscription status enum
 * Matches Stripe subscription statuses
 */
export const SubscriptionStatus = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  UNPAID: 'unpaid',
} as const

export type SubscriptionStatusType = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus]

/**
 * Active subscription statuses (includes both paid and trial subscriptions)
 */
export const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatusType[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING,
]

/**
 * Cancel reason enum
 * Reasons why a subscription was canceled
 */
export const CancelReason = {
  USER_REQUESTED: 'user_requested',
  PAYMENT_FAILED: 'payment_failed',
  ADMIN: 'admin',
  ADMIN_REPLACED: 'admin_replaced',
  ADMIN_DEACTIVATED: 'admin_deactivated',
  EXPIRED: 'expired',
  TRIAL_EXPIRED: 'trial_expired',
  UPGRADED_TO_PAID: 'upgraded_to_paid',
} as const

export type CancelReasonType = (typeof CancelReason)[keyof typeof CancelReason]

/**
 * Subscription display status for UI purposes
 * Represents the visual state of a subscription in the UI
 */
export type SubscriptionDisplayStatus = 'active' | 'canceling' | 'canceled' | 'none'

export interface Subscription {
  id: number
  stripeSubscriptionId: string | null
  status: SubscriptionStatusType
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  trialStart: Date | null
  trialEnd: Date | null
  cancelAt: Date | null
  canceledAt: Date | null
  cancelReason: CancelReasonType | null
  createdAt: Date
  price: {
    id: number
    unitAmount: number
    currency: string

    interval: string
    product: {
      id: number
      name: string
    }
  }
  paymentCustomer: {
    stripeCustomerId: string
    authUser: {
      id: number
      username: string
      email: string
      userProfiles: {
        profileImage: string | null
      }[]
    }
  }
}
