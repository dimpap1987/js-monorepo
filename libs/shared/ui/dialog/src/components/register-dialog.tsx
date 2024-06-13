'use client'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DpDialogContent,
} from '@js-monorepo/components'
import { useRouter } from 'next-nprogress-bar'
import { PropsWithChildren } from 'react'

function RegisterDialogComponent({ children }: Readonly<PropsWithChildren>) {
  const { push } = useRouter()

  return (
    <Dialog
      modal={true}
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
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
