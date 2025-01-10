import { DpButton } from '@js-monorepo/button'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DpDialogContent,
} from '@js-monorepo/components/dialog'
import { useRef } from 'react'
import { useClickAway } from 'react-use'
import { TiWarning } from 'react-icons/ti'

export type ConfirmationDialogProps = {
  isOpen: boolean
  title?: string
  content?: React.ReactNode
  footer?: React.ReactNode
  onClose?: (yes: boolean) => void
}

export const ConfirmationDialog = ({
  isOpen = false,
  title = 'Confirm Action',
  content = 'Are you sure you want to proceed?',
  footer,
  onClose,
}: ConfirmationDialogProps) => {
  const dialogContentRef = useRef<HTMLDivElement | null>(null)
  useClickAway(dialogContentRef, (event) => {
    onClose?.(false)
  })

  return (
    <Dialog
      open={isOpen}
      modal
      onOpenChange={(open) => {
        if (!open) {
          onClose?.(false)
        }
      }}
    >
      <DpDialogContent ref={dialogContentRef}>
        <DialogHeader className="font-semibold justify-center">
          <DialogTitle className="text-left font-semibold text-lg">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 items-center">
          <TiWarning size={46} className="text-danger" />
          <div className="flex flex-col text-base gap-4 font-medium p-5 text-gray-700">
            {content}
          </div>
        </div>
        {footer ? (
          <DialogFooter>{footer}</DialogFooter>
        ) : (
          <DialogFooter>
            <DpButton variant="outline" onClick={() => onClose?.(false)}>
              Cancel
            </DpButton>
            <DpButton
              variant="accent"
              onClick={() => {
                onClose?.(true)
              }}
            >
              Confirm
            </DpButton>
          </DialogFooter>
        )}
      </DpDialogContent>
    </Dialog>
  )
}

ConfirmationDialog.displayName = 'ConfirmationDialog'
