'use client'

import { amountToCents, formatPrice } from '@js-monorepo/currency'
import { useLocale } from 'next-intl'
import { useMemo } from 'react'
import { Subscription } from '../../types'
import { SubscriptionStatus as SubscriptionStatusEnum } from '@js-monorepo/types/subscription'
import { formatForUser } from '@js-monorepo/utils/date'
import { useTimezone } from '@js-monorepo/next/hooks'
import { CancelSubscriptionDialog } from './cancel-subscription-dialog'
import { RenewSubscriptionDialog } from './renew-subscription-dialog'
import { NoSubscriptionState } from './no-subscription-state'
import { PaidSubscriptionInfoBanner } from './paid-subscription-info-banner'
import { PaidSubscriptionCard } from './paid-subscription-card'
import { PlanHeader } from './plan-header'
import { BillingInfo } from './billing-info'
import { SubscriptionActions } from './subscription-actions'
import { usePaidSubscription } from './use-paid-subscription'
import { useSubscriptionActions } from './use-subscription-actions'
import { getSubscriptionStatus } from './utils'
import { SubscriptionStatusIndication } from '../pricing'

/**
 * Plan information for a subscription
 */
export interface PlanInfo {
  name: string
  price: number // Amount in dollars/euros (already converted from cents)
  priceInCents?: number // Original price in cents (for formatting)
  currency?: string // Currency code (e.g., 'USD', 'EUR')
  interval: string
  features: Record<string, string>
  priceId: number
}

/**
 * Active subscription details (either trial or paid)
 */
export interface ActiveSubscription {
  subscription: Subscription
  plan: PlanInfo
}

/**
 * Paid subscription details (when user has a paid subscription separate from trial)
 */
export interface PaidSubscriptionInfo {
  subscriptionId: number
  priceId: number
  planName: string
}

/**
 * Props for the SubscriptionManagement component
 */
interface SubscriptionManagementProps {
  /** The active subscription being displayed (trial or paid) */
  activeSubscription: ActiveSubscription | null
  /** Paid subscription details (if user has a paid subscription separate from the active one) */
  paidSubscription?: PaidSubscriptionInfo | null
  /** Callback when subscription is canceled */
  onCancelSuccess?: () => void
  /** Callback when subscription is renewed */
  onRenewSuccess?: () => void
}

// Types are exported from the component interface definitions above

export function SubscriptionManagement({
  activeSubscription,
  paidSubscription: paidSubscriptionInfo,
  onCancelSuccess,
  onRenewSuccess,
}: SubscriptionManagementProps) {
  const locale = useLocale() as 'en' | 'el'
  const userTimezone = useTimezone()

  // Extract active subscription data
  const subscription = activeSubscription?.subscription ?? null
  const plan = activeSubscription?.plan
  const isTrial = subscription?.status === SubscriptionStatusEnum.TRIALING

  // SubscriptionStatusIndication expects the "session subscription" shape.
  // Build a lightweight version from what we already have here.
  const sessionLikeSubscription = useMemo(() => {
    if (!subscription || !plan) return undefined

    const hasPaidSubscription = !!paidSubscriptionInfo?.subscriptionId

    return {
      isSubscribed: true,
      isTrial,
      plan: plan.name,
      subscriptionId: subscription.id,
      priceId: plan.priceId,
      trialEnd: subscription.trialEnd ?? null,
      hasPaidSubscription,
      paidSubscriptionPlan: paidSubscriptionInfo?.planName ?? null,
      paidSubscriptionId: paidSubscriptionInfo?.subscriptionId ?? null,
      paidSubscriptionPriceId: paidSubscriptionInfo?.priceId ?? null,
      trialSubscriptionPlan: isTrial ? plan.name : null,
      trialSubscriptionId: isTrial ? subscription.id : null,
    }
  }, [isTrial, paidSubscriptionInfo, plan, subscription])

  // Fetch paid subscription data (only when needed)
  const { paidSubscriptionData, isLoadingPaidSubscription, setPaidSubscriptionData } = usePaidSubscription({
    subscription,
    paidSubscriptionInfo,
    isTrial,
  })

  // Handle subscription actions (cancel, renew, manage)
  const {
    isCancelDialogOpen,
    isCancelPaidDialogOpen,
    isRenewDialogOpen,
    isLoading,
    isPortalLoading,
    handleCancelClick,
    handleCancelConfirm,
    handleCancelPaidClick,
    handleCancelPaidConfirm,
    handleRenewClick,
    handleRenewConfirm,
    handleManageSubscription,
    setIsCancelDialogOpen,
    setIsCancelPaidDialogOpen,
    setIsRenewDialogOpen,
  } = useSubscriptionActions({
    plan,
    subscription,
    paidSubscriptionInfo,
    onCancelSuccess,
    onRenewSuccess,
    setPaidSubscriptionData,
  })

  // Format price with currency symbol
  const formattedPrice = useMemo(() => {
    if (!plan) return ''
    const cents = plan.priceInCents ?? amountToCents(plan.price)
    return formatPrice(cents, locale, plan.currency)
  }, [plan, locale])

  const status = getSubscriptionStatus(subscription)
  const periodEnd = subscription?.currentPeriodEnd
    ? formatForUser(subscription.currentPeriodEnd, userTimezone, 'PPP')
    : null
  const cancelAt = subscription?.cancelAt ? formatForUser(subscription.cancelAt, userTimezone, 'PPP') : null

  // Paid subscription status calculations
  const paidSubscriptionStatus = paidSubscriptionData ? getSubscriptionStatus(paidSubscriptionData) : null
  const isPaidSubscriptionActive = !!(
    paidSubscriptionData &&
    (paidSubscriptionData.status === SubscriptionStatusEnum.ACTIVE ||
      String(paidSubscriptionData.status).toLowerCase() === 'active') &&
    paidSubscriptionStatus !== 'canceled' &&
    paidSubscriptionStatus !== 'canceling'
  )
  const isPaidSubscriptionCanceled = paidSubscriptionStatus === 'canceled'
  const isPaidSubscriptionCanceling = paidSubscriptionStatus === 'canceling'

  // No subscription state
  if (status === 'none' || status === 'canceled' || subscription?.status === SubscriptionStatusEnum.CANCELED) {
    return <NoSubscriptionState />
  }

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      {plan && (
        <PlanHeader
          plan={plan}
          formattedPrice={formattedPrice}
          status={status}
          isTrial={isTrial}
          paidPlanName={paidSubscriptionInfo?.planName}
        />
      )}

      {/* Billing Info */}
      {!isTrial && <BillingInfo periodEnd={periodEnd} cancelAt={cancelAt} isCanceling={status === 'canceling'} />}

      {isTrial && <SubscriptionStatusIndication subscription={sessionLikeSubscription} className="w-full" />}

      {/* Actions */}
      <SubscriptionActions
        subscription={subscription}
        status={status}
        isPortalLoading={isPortalLoading}
        onManageClick={handleManageSubscription}
        onRenewClick={handleRenewClick}
        onCancelClick={handleCancelClick}
      />

      {/* Inform user about paid subscription if they're on a trial */}
      {isTrial && paidSubscriptionInfo && !isPaidSubscriptionCanceled && (
        <PaidSubscriptionInfoBanner
          planName={plan?.name || ''}
          paidPlanName={paidSubscriptionInfo.planName}
          isCanceling={isPaidSubscriptionCanceling}
        />
      )}

      {/* Paid Subscription Management Section (when on trial) */}
      {isTrial &&
        paidSubscriptionInfo &&
        !isLoadingPaidSubscription &&
        paidSubscriptionData &&
        paidSubscriptionStatus && (
          <PaidSubscriptionCard
            planName={paidSubscriptionInfo.planName}
            subscription={paidSubscriptionData}
            status={paidSubscriptionStatus}
            isActive={isPaidSubscriptionActive}
            isCanceled={isPaidSubscriptionCanceled}
            isCanceling={isPaidSubscriptionCanceling}
            onCancelClick={handleCancelPaidClick}
          />
        )}

      {/* Cancel Dialog */}
      {plan && (
        <CancelSubscriptionDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          onConfirm={handleCancelConfirm}
          isLoading={isLoading}
          subscription={subscription}
          planName={plan.name}
          features={plan.features}
        />
      )}

      {/* Cancel Paid Subscription Dialog */}
      {paidSubscriptionInfo && plan && (
        <CancelSubscriptionDialog
          isOpen={isCancelPaidDialogOpen}
          onClose={() => setIsCancelPaidDialogOpen(false)}
          onConfirm={handleCancelPaidConfirm}
          isLoading={isLoading}
          subscription={paidSubscriptionData}
          planName={paidSubscriptionInfo.planName}
          features={plan.features}
        />
      )}

      {/* Renew Dialog */}
      {plan && (
        <RenewSubscriptionDialog
          isOpen={isRenewDialogOpen}
          onClose={() => setIsRenewDialogOpen(false)}
          onConfirm={handleRenewConfirm}
          isLoading={isLoading}
          subscription={subscription}
          planName={plan.name}
        />
      )}
    </div>
  )
}
