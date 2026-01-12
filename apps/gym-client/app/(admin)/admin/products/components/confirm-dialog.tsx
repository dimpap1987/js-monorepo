'use client'

import { DpButton } from '@js-monorepo/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@js-monorepo/components/ui/dialog'
import { useEffect } from 'react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  isLoading?: boolean
  variant?: 'destructive' | 'default'
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
  variant = 'default',
}: ConfirmDialogProps) {
  // Fix for Radix Dialog not properly cleaning up pointer-events on body
  // useEffect(() => {
  //   if (!open) {
  //     const timeout = setTimeout(() => {
  //       document.body.style.pointerEvents = ''
  //     }, 100)
  //     return () => clearTimeout(timeout)
  //   }
  // }, [open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DpButton variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelLabel}
          </DpButton>
          <DpButton variant={variant === 'destructive' ? 'danger' : 'accent'} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmLabel}
          </DpButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
