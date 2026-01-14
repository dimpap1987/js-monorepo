'use client'

import { PlanBadge } from '../plan-badge'
import { PlanInfo } from './subscription-management'
import { StatusBadge } from './status-badge'
import { SubscriptionDisplayStatus } from '@js-monorepo/types/subscription'

interface PlanHeaderProps {
  plan: PlanInfo
  formattedPrice: string
  status: SubscriptionDisplayStatus
  isTrial: boolean
  paidPlanName?: string | null
}

export function PlanHeader({ plan, formattedPrice, status, isTrial, paidPlanName }: PlanHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2 flex-wrap">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-semibold text-foreground capitalize">
            {plan.name} Plan {isTrial && <span className="text-sm font-normal text-status-info">(Trial)</span>}
          </h2>
          <StatusBadge status={status} />
        </div>
        <p className="text-2xl font-bold text-foreground">
          {formattedPrice}
          <span className="text-base font-normal text-foreground-neutral">/{plan.interval}</span>
        </p>
        {isTrial && paidPlanName && (
          <p className="text-sm text-foreground-muted mt-1">
            Active subscription: <span className="font-medium capitalize">{paidPlanName}</span>
          </p>
        )}
      </div>
      <PlanBadge plan={plan.name} size="md" />
    </div>
  )
}
