import { formatUTC, DATE_CONFIG } from '@js-monorepo/utils/date'
import { capitalize } from 'lodash'

// Use relative paths for client-side navigation via Next.js router
const subscriptionLink = () => `<a href="/settings/subscription">Manage Subscription</a>`

const pricingLink = () => `<a href="/pricing">View Plans</a>`

export interface SubscriptionNotificationData {
  planName: string
  cancelAt?: Date
}

/**
 * Notification when a subscription is successfully activated
 */
export function getSubscriptionActivatedMessage({ planName }: SubscriptionNotificationData): string {
  return `
    Your <strong>${capitalize(planName)}</strong> plan is now active!
    Thank you for subscribing. You now have access to all premium features.
    ${subscriptionLink()}
  `.trim()
}

/**
 * Notification when a subscription is renewed (cancellation undone)
 */
export function getSubscriptionRenewedMessage({ planName }: SubscriptionNotificationData): string {
  return `
    Great news! Your <strong>${capitalize(planName)}</strong> plan has been renewed.
    Your subscription will continue as normal.
    ${subscriptionLink()}
  `.trim()
}

/**
 * Notification when a subscription is scheduled to cancel
 */
export function getSubscriptionCanceledMessage({ planName, cancelAt }: SubscriptionNotificationData): string {
  const formattedDate = cancelAt ? `${formatUTC(cancelAt, DATE_CONFIG.FORMATS.DATE)}` : 'the end of your billing period'

  return `
    Your <strong>${capitalize(planName)}</strong> plan has been canceled.
    You'll continue to have access until <strong>${formattedDate}</strong>.
    Changed your mind? ${subscriptionLink()}
  `.trim()
}

/**
 * Notification when a subscription has expired
 */
export function getSubscriptionExpiredMessage({ planName }: SubscriptionNotificationData): string {
  return `
    Your <strong>${capitalize(planName)}</strong> plan has expired.
    You've been moved to the free plan. Resubscribe anytime to regain access to premium features.
    ${pricingLink()}
  `.trim()
}

/**
 * Notification when a subscription plan is changed/upgraded
 */
export function getSubscriptionChangedMessage({
  planName,
}: SubscriptionNotificationData & { previousPlanName?: string }): string {
  return `
    Your subscription has been updated to <strong>${capitalize(planName)}</strong>.
    Your new plan is now active with all its features.
    ${subscriptionLink()}
  `.trim()
}

/**
 * Notification when a trial is started
 */
export function getTrialStartedMessage({ planName }: SubscriptionNotificationData): string {
  return `
    Your free trial of <strong>${capitalize(planName)}</strong> has started!
    Enjoy full access to all premium features. No credit card required.
    ${subscriptionLink()}
  `.trim()
}

/**
 * Notification when a trial has expired
 */
export function getTrialExpiredMessage({ planName }: SubscriptionNotificationData): string {
  return `
    Your <strong>${capitalize(planName)}</strong> trial has ended.
    Subscribe now to continue enjoying premium features.
    ${pricingLink()}
  `.trim()
}
