import { Subscription } from '../../types'
import {
  SubscriptionStatus as SubscriptionStatusEnum,
  SubscriptionDisplayStatus,
} from '@js-monorepo/types/subscription'

/**
 * Get the display status of a subscription
 */
export function getSubscriptionStatus(subscription: Subscription | null): SubscriptionDisplayStatus {
  if (!subscription) return 'none'
  // Check canceled status first - cancelAt may still have a value after expiration
  if (subscription.status === SubscriptionStatusEnum.CANCELED) return 'canceled'
  // Subscription is scheduled to cancel but still active
  if (subscription.cancelAt || subscription.canceledAt) return 'canceling'
  return 'active'
}
