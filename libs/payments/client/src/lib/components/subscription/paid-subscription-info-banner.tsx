'use client'

import { Info } from 'lucide-react'

interface PaidSubscriptionInfoBannerProps {
  planName: string
  paidPlanName: string
  isCanceling: boolean
}

export function PaidSubscriptionInfoBanner({ planName, paidPlanName, isCanceling }: PaidSubscriptionInfoBannerProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 ${
        isCanceling ? 'border-status-warning bg-status-warning-bg' : 'border-status-info bg-status-info-bg'
      }`}
    >
      <Info className={`h-5 w-5 shrink-0 mt-0.5 ${isCanceling ? 'text-status-warning' : 'text-status-info'}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {isCanceling ? 'Your paid subscription is scheduled to cancel' : 'Your paid subscription is active'}
        </p>
        <p className="text-sm text-foreground-neutral">
          You're currently on a <strong>{planName}</strong> trial. Your <strong>{paidPlanName}</strong> subscription{' '}
          {isCanceling ? 'will end' : 'remains active and will continue'} after the trial ends.
        </p>
      </div>
    </div>
  )
}
