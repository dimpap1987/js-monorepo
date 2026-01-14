'use client'

import { Calendar, CreditCard, XCircle } from 'lucide-react'

interface BillingInfoProps {
  periodEnd: string | null
  cancelAt: string | null
  isCanceling: boolean
}

export function BillingInfo({ periodEnd, cancelAt, isCanceling }: BillingInfoProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {isCanceling && cancelAt ? (
        <div className="flex items-start gap-3 rounded-lg border border-status-warning bg-status-warning-bg p-4">
          <XCircle className="h-5 w-5 shrink-0 text-status-warning mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Cancellation scheduled</p>
            <p className="text-sm text-foreground-neutral">Your access ends on {cancelAt}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-background-secondary p-4">
          <Calendar className="h-5 w-5 shrink-0 text-foreground-muted mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Next billing date</p>
            <p className="text-sm text-foreground-neutral">{periodEnd || 'N/A'}</p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-lg border border-border bg-background-secondary p-4">
        <CreditCard className="h-5 w-5 shrink-0 text-foreground-muted mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Payment method</p>
          <p className="text-sm text-foreground-neutral">Managed by Stripe</p>
        </div>
      </div>
    </div>
  )
}
