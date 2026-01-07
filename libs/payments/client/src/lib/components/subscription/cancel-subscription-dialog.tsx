'use client'

import { DpButton } from '@js-monorepo/button'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DpDialogContent,
} from '@js-monorepo/components/ui/dialog'
import { AlertTriangle, Calendar, X } from 'lucide-react'
import { Subscription } from '../../types'
import { formatForUser } from '@js-monorepo/utils/date'
import { useTimezone } from '@js-monorepo/next/hooks'

interface CancelSubscriptionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  subscription?: Subscription | null
  planName: string
  features: Record<string, string>
}

export function CancelSubscriptionDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  subscription,
  planName,
  features,
}: CancelSubscriptionDialogProps) {
  const userTimezone = useTimezone()
  const periodEnd = subscription?.currentPeriodEnd
    ? formatForUser(subscription.currentPeriodEnd, userTimezone, 'PPP')
    : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DpDialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-warning-bg">
            <AlertTriangle className="h-6 w-6 text-status-warning" />
          </div>
          <DialogTitle className="text-center text-xl">
            Cancel <span className="capitalize bg-status-info-bg text-foreground px-2 rounded-md">{planName}</span>{' '}
            Plan?
          </DialogTitle>
          <DialogDescription className="text-center text-foreground-neutral">
            We're sorry to see you go. Here's what you'll lose access to:
          </DialogDescription>
        </DialogHeader>

        {/* What they'll lose */}
        <div className="my-4 rounded-lg border border-border bg-background-secondary p-4">
          <p className="mb-3 text-sm font-medium text-foreground-muted">Features you'll lose:</p>
          <ul className="space-y-2">
            {Object.values(features).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-status-error" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* When access ends */}
        {periodEnd && (
          <div className="flex items-center gap-3 rounded-lg border border-status-info bg-status-info-bg p-3">
            <Calendar className="h-5 w-5 shrink-0 text-status-info" />
            <div className="text-sm">
              <p className="font-medium text-foreground">You'll have access until</p>
              <p className="text-foreground-neutral">{periodEnd}</p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6 flex-col gap-2 sm:flex-col">
          <DpButton variant="outline" onClick={onClose} className="w-full" disabled={isLoading}>
            Keep My Subscription
          </DpButton>
          <DpButton variant="danger" onClick={onConfirm} className="w-full" loading={isLoading} disabled={isLoading}>
            Cancel Subscription
          </DpButton>
        </DialogFooter>
      </DpDialogContent>
    </Dialog>
  )
}
