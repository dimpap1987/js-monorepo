import { DpButton } from '@js-monorepo/button'
import { ReactNode, forwardRef } from 'react'
import {
  DpDialog,
  DpDialogContent,
  DpDialogFooter,
  DpDialogHeader,
} from '../lib/dialog'

export interface DpConfirmationDialogProps {
  readonly className?: string
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly title?: string // Header content
  readonly content?: string | ReactNode // Main content
  readonly confirmLabel?: string // Confirm button label
  readonly onConfirm?: () => void // Confirm button action
  readonly cancelLabel?: string // Cancel button label
  readonly onCancel?: () => void // Cancel button action
}

const DpConfirmationDialog = forwardRef<
  HTMLDivElement,
  DpConfirmationDialogProps
>(
  (
    {
      className,
      isOpen,
      onClose,
      title = 'Apply Changes?',
      content = 'This action will apply certain changes. Do you want to continue?',
      confirmLabel = 'Continue',
      onConfirm,
      cancelLabel = 'Go Back',
      onCancel,
    },
    ref
  ) => {
    return (
      <DpDialog
        isOpen={isOpen}
        onClose={onClose}
        className={`${className} shadow-2xl shadow-cyan-500/50`}
        ref={ref}
      >
        {title && <DpDialogHeader>{title}</DpDialogHeader>}
        {content && <DpDialogContent>{content}</DpDialogContent>}
        <DpDialogFooter>
          <div className="grid gap-2 p-4 text-blue-gray-500 grid-cols-1 lg:grid-cols-4">
            <DpButton
              className="lg:col-start-3 lg:col-end-4"
              data-ripple-light="true"
              data-dialog-close="true"
              onClick={() => {
                onConfirm?.()
              }}
            >
              {confirmLabel}
            </DpButton>
            <DpButton
              className="lg:col-start-4 lg:col-end-5 bg-destructive hover:bg-destructive-hover"
              data-ripple-dark="true"
              data-dialog-close="true"
              onClick={() => {
                onCancel?.()
              }}
            >
              {cancelLabel}
            </DpButton>
          </div>
        </DpDialogFooter>
      </DpDialog>
    )
  }
)

DpConfirmationDialog.displayName = 'DpConfirmationDialog'

export default DpConfirmationDialog
