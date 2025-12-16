'use client'
import { Dialog, DialogHeader, DialogTitle, DpDialogContent } from '@js-monorepo/components/dialog'
import { useRouter } from 'next-nprogress-bar'
import { PropsWithChildren } from 'react'

function RegisterDialogComponent({ children, open }: Readonly<PropsWithChildren & { open: boolean }>) {
  const { push } = useRouter()

  return (
    <Dialog
      open={open}
      modal={true}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          push('/')
        }
      }}
    >
      <DpDialogContent
        onInteractOutside={(e) => {
          // prevent from closing when clicking outside the dialog
          e.preventDefault()
        }}
      >
        <DialogHeader className="justify-center mb-4">
          <DialogTitle className="text-center text-xl font-semibold tracking-tight">Complete Your Profile</DialogTitle>
        </DialogHeader>
        <section className="overflow-x-hidden space-y-4">{children}</section>
      </DpDialogContent>
    </Dialog>
  )
}

export { RegisterDialogComponent }
