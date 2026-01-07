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
import { RefreshCw } from 'lucide-react'
import { Subscription } from '../../types'

interface RenewSubscriptionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  subscription?: Subscription | null
  planName: string
}

export function RenewSubscriptionDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  subscription,
  planName,
}: RenewSubscriptionDialogProps) {
  const nextChargeDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DpDialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Renew subscription</DialogTitle>
          <DialogDescription className="text-center text-foreground-neutral">
            You will keep access to <span className="font-semibold text-primary capitalize">{planName}</span>
            {nextChargeDate && (
              <>
                {' '}
                and your next charge will be processed on{' '}
                <span className="font-semibold text-primary">{nextChargeDate}</span>
              </>
            )}
            .
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex sm:justify-center border-t-0">
          <DpButton variant="primary" onClick={onConfirm} className="w-full" loading={isLoading} disabled={isLoading}>
            Renew
          </DpButton>
          <DpButton variant="outline" onClick={onClose} className="w-full" disabled={isLoading}>
            Go back
          </DpButton>
        </DialogFooter>
      </DpDialogContent>
    </Dialog>
  )
}
