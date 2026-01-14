export const TRIAL_DURATION_DAYS = 14

// Re-export subscription enums from shared types for backward compatibility
// Prefer importing from @js-monorepo/types/subscription in new code
export {
  SubscriptionStatus,
  SubscriptionStatusType,
  ACTIVE_SUBSCRIPTION_STATUSES,
  CancelReason,
  CancelReasonType,
} from '@js-monorepo/types/subscription'
