'use client'

import { Info } from 'lucide-react'
import { formatForUser } from '@js-monorepo/utils/date'
import { useTimezone } from '@js-monorepo/next/hooks'
import { SessionSubscription } from '../../types'

interface SubscriptionStatusIndicationProps {
  subscription: SessionSubscription | undefined
  className?: string
}

export function SubscriptionStatusIndication({ subscription, className }: SubscriptionStatusIndicationProps) {
  const userTimezone = useTimezone()

  // Show indication if user has trial and/or paid subscription
  const showIndication = subscription?.isSubscribed && (subscription?.isTrial || subscription?.hasPaidSubscription)

  if (!showIndication) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex items-start gap-3 rounded-lg border border-status-info bg-status-info-bg p-4">
        <Info className="h-5 w-5 shrink-0 text-status-info mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-1">Your Current Subscription Status</p>
          <div className="space-y-1 text-sm text-foreground-neutral">
            {subscription?.isTrial && subscription?.plan && (
              <p>
                <span className="font-medium capitalize">{subscription.plan}</span> trial is active
                {subscription.trialEnd && ` until ${formatForUser(subscription.trialEnd, userTimezone, 'PPP')}`}
              </p>
            )}
            {subscription?.hasPaidSubscription && subscription?.paidSubscriptionPlan && (
              <p>
                Your <span className="font-medium capitalize">{subscription.paidSubscriptionPlan}</span> subscription
                remains active and will continue after the trial ends.
              </p>
            )}
            {!subscription?.isTrial && !subscription?.hasPaidSubscription && subscription?.plan && (
              <p>
                Active plan: <span className="font-medium capitalize">{subscription.plan}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
