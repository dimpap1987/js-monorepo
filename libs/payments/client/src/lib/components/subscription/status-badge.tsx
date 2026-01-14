'use client'

import { CheckCircle, Sparkles, XCircle } from 'lucide-react'
import { SubscriptionDisplayStatus } from '@js-monorepo/types/subscription'

interface StatusBadgeProps {
  status: SubscriptionDisplayStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    active: {
      label: 'Active',
      className: 'bg-status-success-bg text-status-success border-status-success',
      icon: CheckCircle,
    },
    trialing: {
      label: 'Trial',
      className: 'bg-status-info-bg text-status-info border-status-info',
      icon: Sparkles,
    },
    canceling: {
      label: 'Cancels Soon',
      className: 'bg-status-warning-bg text-status-warning border-status-warning',
      icon: XCircle,
    },
    canceled: {
      label: 'Canceled',
      className: 'bg-status-error-bg text-status-error border-status-error',
      icon: XCircle,
    },
    none: {
      label: 'No Subscription',
      className: 'bg-background-secondary text-foreground-muted border-border',
      icon: XCircle,
    },
  }

  const { label, className, icon: Icon } = config[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
