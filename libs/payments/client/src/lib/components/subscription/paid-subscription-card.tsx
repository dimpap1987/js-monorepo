'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { formatForUser } from '@js-monorepo/utils/date'
import { useTimezone } from '@js-monorepo/next/hooks'
import { Subscription } from '../../types'
import { SubscriptionDisplayStatus } from '@js-monorepo/types/subscription'
import { StatusBadge } from './status-badge'

interface PaidSubscriptionCardProps {
  planName: string
  subscription: Subscription
  status: SubscriptionDisplayStatus
  isActive: boolean
  isCanceled: boolean
  isCanceling: boolean
  onCancelClick: () => void
}

export function PaidSubscriptionCard({
  planName,
  subscription,
  status,
  isActive,
  isCanceled,
  isCanceling,
  onCancelClick,
}: PaidSubscriptionCardProps) {
  const userTimezone = useTimezone()

  const periodEnd = subscription.currentPeriodEnd
    ? formatForUser(subscription.currentPeriodEnd, userTimezone, 'PPP')
    : null
  const cancelAt = subscription.cancelAt ? formatForUser(subscription.cancelAt, userTimezone, 'PPP') : null

  return (
    <div className="rounded-lg border border-border bg-background-secondary p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground capitalize">Your {planName} Subscription</h3>
            <StatusBadge status={status} />
          </div>
          {isActive && (
            <p className="text-sm text-foreground-neutral">
              This is your active paid subscription that will continue after your trial ends.
            </p>
          )}
          {isCanceling && cancelAt && (
            <p className="text-sm text-foreground-neutral">Your subscription is scheduled to cancel on {cancelAt}.</p>
          )}
          {isCanceled && (
            <p className="text-sm text-foreground-neutral">
              Your paid subscription has been canceled and will not renew.
            </p>
          )}
          {periodEnd && (
            <p className="text-xs text-foreground-muted mt-1">
              {isCanceled ? 'Ended' : 'Next billing'}: {periodEnd}
            </p>
          )}
        </div>
        {isActive && (
          <Button variant="ghost" className="text-status-error hover:text-status-error" onClick={onCancelClick}>
            Cancel {planName}
          </Button>
        )}
      </div>
    </div>
  )
}
