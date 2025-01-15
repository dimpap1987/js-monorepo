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
  smallMessage?: React.ReactNode
}

export const ConfirmationDialog = ({
  isOpen = false,
  title = 'Confirm Action',
  content = (
    <span className="font-semibold">Are you sure you want to proceed?</span>
  ),
  footer,
  onClose,
  smallMessage,
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
          <TiWarning size={46} className="text-danger shrink-0" />
          <div className="flex flex-col text-base gap-3 font-medium p-5 text-gray-700">
            <div>{content}</div>
            <div>{smallMessage}</div>
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
              variant="primary"
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
