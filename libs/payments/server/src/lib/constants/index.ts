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

export const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatusType[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING,
]

export const CancelReason = {
  USER_REQUESTED: 'user_requested',
  PAYMENT_FAILED: 'payment_failed',
  ADMIN: 'admin',
  EXPIRED: 'expired',
} as const

export type CancelReasonType = (typeof CancelReason)[keyof typeof CancelReason]
