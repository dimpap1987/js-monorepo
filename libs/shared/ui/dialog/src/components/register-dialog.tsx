'use client'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DpDialogContent,
} from '@js-monorepo/components'
import { useRouter } from 'next-nprogress-bar'
import { PropsWithChildren } from 'react'

function RegisterDialogComponent({
  children,
  open,
}: Readonly<PropsWithChildren & { open: boolean }>) {
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
        <DialogHeader className="font-semibold justify-center">
          <DialogTitle className="text-center font-bold">Sign Up</DialogTitle>
        </DialogHeader>
        <section>{children}</section>
      </DpDialogContent>
    </Dialog>
  )
}

export { RegisterDialogComponent }
