'use client'

import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { InvoiceStatus } from '../../types'

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
}

const statusConfig: Record<InvoiceStatus, { label: string; className: string; icon: typeof CheckCircle }> = {
  paid: {
    label: 'Paid',
    className: 'bg-status-success-bg text-status-success border-status-success',
    icon: CheckCircle,
  },
  open: {
    label: 'Pending',
    className: 'bg-status-warning-bg text-status-warning border-status-warning',
    icon: Clock,
  },
  draft: {
    label: 'Draft',
    className: 'bg-background-secondary text-foreground-muted border-border',
    icon: Clock,
  },
  void: {
    label: 'Void',
    className: 'bg-background-secondary text-foreground-muted border-border',
    icon: XCircle,
  },
  uncollectible: {
    label: 'Failed',
    className: 'bg-status-error-bg text-status-error border-status-error',
    icon: XCircle,
  },
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft
  const { label, className, icon: Icon } = config

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
