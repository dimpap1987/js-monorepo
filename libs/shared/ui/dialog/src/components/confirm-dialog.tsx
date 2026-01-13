'use client'

import { ButtonVariant, DpButton } from '@js-monorepo/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@js-monorepo/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  isLoading?: boolean
  variant?: ButtonVariant
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading,
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="border-b-0">
          <DialogTitle className="mb-2">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DpButton variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelLabel}
          </DpButton>
          <DpButton variant={variant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmLabel}
          </DpButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
