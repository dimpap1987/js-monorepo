'use client'

import { DpButton } from '@js-monorepo/button'
import { RefreshCw } from 'lucide-react'
import { SubscriptionStatus as SubscriptionStatusEnum } from '@js-monorepo/types/subscription'
import { Subscription } from '../../types'
import { SubscriptionDisplayStatus } from '@js-monorepo/types/subscription'

interface SubscriptionActionsProps {
  subscription: Subscription | null
  status: SubscriptionDisplayStatus
  isPortalLoading: boolean
  onManageClick: () => void
  onRenewClick: () => void
  onCancelClick: () => void
}

export function SubscriptionActions({
  subscription,
  status,
  isPortalLoading,
  onManageClick,
  onRenewClick,
  onCancelClick,
}: SubscriptionActionsProps) {
  const isTrial = subscription?.status === SubscriptionStatusEnum.TRIALING
  const canCancel =
    (subscription?.status === SubscriptionStatusEnum.ACTIVE ||
      subscription?.status === SubscriptionStatusEnum.TRIALING) &&
    status !== 'canceling'

  return (
    <div className="flex flex-wrap gap-3 pt-2 justify-end">
      {!isTrial && (
        <DpButton variant="outline" onClick={onManageClick} loading={isPortalLoading}>
          Manage
        </DpButton>
      )}
      {!isTrial && status === 'canceling' && (
        <DpButton variant="primary" onClick={onRenewClick}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Renew
        </DpButton>
      )}
      {canCancel && (
        <DpButton variant="ghost" className="text-status-error hover:text-status-error" onClick={onCancelClick}>
          Cancel Subscription
        </DpButton>
      )}
    </div>
  )
}
