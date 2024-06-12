'use client'

import { useSession } from '@js-monorepo/auth-client'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DpDialogContent,
} from '@js-monorepo/components'
import { useNotifications } from '@js-monorepo/notification'
import { useRouter } from 'next-nprogress-bar'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RegisterForm } from './register-form'
import { RegisterDialogType } from './types'

export function RegisterDialog({
  formInput,
  userProfileImage,
}: RegisterDialogType) {
  //hooks
  const pathname = usePathname()
  const { push } = useRouter()
  const { user } = useSession()
  const [addNotification] = useNotifications()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // this is a hacky way in order to disable a hydration error caused by radix
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (user?.username) {
      addNotification({
        message: `Welcome aboard, ${user.username}! 🚀`,
        duration: 5000,
      })
    }
  }, [user?.username, addNotification])

  if (pathname !== '/auth/onboarding' || !hydrated) return null

  return (
    <Dialog
      modal={false}
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
        <section>
          {userProfileImage && (
            <div className="p-2 flex justify-center">
              <Image
                className="rounded-2xl"
                width={80}
                height={80}
                alt="user profile"
                src={userProfileImage}
              ></Image>
            </div>
          )}
          <RegisterForm formInput={formInput}></RegisterForm>
        </section>
      </DpDialogContent>
    </Dialog>
  )
}
