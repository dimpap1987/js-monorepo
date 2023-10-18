import { ButtonComponent } from '@js-monorepo/button'
import { ReactNode } from 'react'
import {
  DialogComponent,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../lib/dialog'

export interface ConfirmationDialogComponentProps {
  className?: string
  isOpen: boolean
  onClose: () => void
  title?: string // Header content
  content?: string | ReactNode // Main content
  confirmLabel?: string // Confirm button label
  onConfirm?: () => void // Confirm button action
  cancelLabel?: string // Cancel button label
  onCancel?: () => void // Cancel button action
}

function ConfirmationDialogComponent({
  className,
  isOpen,
  onClose,
  title = 'Apply Changes?',
  content = 'This action will apply certain changes. Do you want to continue?',
  confirmLabel = 'Continue',
  onConfirm,
  cancelLabel = 'Go Back',
  onCancel,
}: ConfirmationDialogComponentProps) {
  return (
    <DialogComponent
      isOpen={isOpen}
      onClose={onClose}
      className={`${className} shadow-2xl shadow-cyan-500/50`}
    >
      {title && <DialogHeader>{title}</DialogHeader>}
      {content && <DialogContent>{content}</DialogContent>}
      <DialogFooter>
        <div className="grid gap-2 p-4 text-blue-gray-500 grid-cols-1 lg:grid-cols-4">
          <ButtonComponent
            className="lg:col-start-3 lg:col-end-4"
            data-ripple-light="true"
            data-dialog-close="true"
            onClick={() => {
              onConfirm?.()
            }}
          >
            {confirmLabel}
          </ButtonComponent>
          <ButtonComponent
            className="lg:col-start-4 lg:col-end-5 bg-gray hover:bg-gray-hover"
            data-ripple-dark="true"
            data-dialog-close="true"
            onClick={() => {
              onCancel?.()
            }}
          >
            {cancelLabel}
          </ButtonComponent>
        </div>
      </DialogFooter>
    </DialogComponent>
  )
}

export default ConfirmationDialogComponent
