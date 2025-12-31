import { capitalize } from 'lodash'
import moment from 'moment'

const subscriptionLink = (appUrl: string) =>
  `<a href="${appUrl}/settings/subscription" style="color: #3b82f6; text-decoration: underline;">Manage Subscription</a>`

const pricingLink = (appUrl: string) =>
  `<a href="${appUrl}/pricing" style="color: #3b82f6; text-decoration: underline;">View Plans</a>`

export interface SubscriptionNotificationData {
  planName: string
  appUrl: string
  cancelAt?: Date
}

/**
 * Notification when a subscription is successfully activated
 */
export function getSubscriptionActivatedMessage({ planName, appUrl }: SubscriptionNotificationData): string {
  return `
    Your <strong>${capitalize(planName)}</strong> plan is now active!
    Thank you for subscribing. You now have access to all premium features.
    ${subscriptionLink(appUrl)}
  `.trim()
}

/**
 * Notification when a subscription is renewed (cancellation undone)
 */
export function getSubscriptionRenewedMessage({ planName, appUrl }: SubscriptionNotificationData): string {
  return `
    Great news! Your <strong>${capitalize(planName)}</strong> plan has been renewed.
    Your subscription will continue as normal.
    ${subscriptionLink(appUrl)}
  `.trim()
}

/**
 * Notification when a subscription is scheduled to cancel
 */
export function getSubscriptionCanceledMessage({ planName, appUrl, cancelAt }: SubscriptionNotificationData): string {
  const formattedDate = cancelAt ? moment(cancelAt).format('MMMM D, YYYY') : 'the end of your billing period'
  const formattedTime = cancelAt ? moment(cancelAt).format('h:mm A') : ''

  return `
    Your <strong>${capitalize(planName)}</strong> plan has been canceled.
    You'll continue to have access until <strong>${formattedDate}</strong>${formattedTime ? ` at <strong>${formattedTime}</strong>` : ''}.
    Changed your mind? ${subscriptionLink(appUrl)}
  `.trim()
}

/**
 * Notification when a subscription has expired
 */
export function getSubscriptionExpiredMessage({ planName, appUrl }: SubscriptionNotificationData): string {
  return `
    Your <strong>${capitalize(planName)}</strong> plan has expired.
    You've been moved to the free plan. Resubscribe anytime to regain access to premium features.
    ${pricingLink(appUrl)}
  `.trim()
}

/**
 * Notification when a subscription plan is changed/upgraded
 */
export function getSubscriptionChangedMessage({
  planName,
  appUrl,
}: SubscriptionNotificationData & { previousPlanName?: string }): string {
  return `
    Your subscription has been updated to <strong>${capitalize(planName)}</strong>.
    Your new plan is now active with all its features.
    ${subscriptionLink(appUrl)}
  `.trim()
}
