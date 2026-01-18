import { Button } from '@js-monorepo/components/ui/button'
import { Dialog, DialogFooter, DialogHeader, DialogTitle, DpDialogContent } from '@js-monorepo/components/ui/dialog'
import { TiWarning } from 'react-icons/ti'
export type ErrorDialogProps = {
  isOpen: boolean
  title?: string
  errorMessage?: React.ReactNode
  onClose?: () => void
  footer?: React.ReactNode
}

export const ErrorDialog = ({
  isOpen = false,
  title = 'An Error Occurred',
  errorMessage = 'Something went wrong. Please try again.',
  onClose,
  footer,
}: ErrorDialogProps) => {
  return (
    <Dialog
      open={isOpen}
      modal
      onOpenChange={(open) => {
        if (!open) {
          onClose?.()
        }
      }}
    >
      <DpDialogContent
        onInteractOutside={(e) => {
          // prevent from closing when clicking outside the dialog
          e.preventDefault()
        }}
      >
        <DialogHeader className="justify-center">
          <DialogTitle className="text-left text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-3 items-center">
          <TiWarning size={46} className="text-danger shrink-0" />
          <div className="text-base text-gray-700 p-4 font-medium">{errorMessage}</div>
        </div>
        {footer ? (
          <DialogFooter>{footer}</DialogFooter>
        ) : (
          <DialogFooter className="justify-end gap-2">
            <Button
              variant="primary"
              onClick={() => {
                onClose?.()
              }}
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DpDialogContent>
    </Dialog>
  )
}

ErrorDialog.displayName = 'ErrorDialog'
