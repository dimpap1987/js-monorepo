'use client'

import { useSession } from '@js-monorepo/auth-client'
import { RegisterDialogComponent } from '@js-monorepo/dialog'
import { useNotifications } from '@js-monorepo/notification'
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
  const { user } = useSession()
  const [addNotification] = useNotifications()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user?.username) {
      addNotification({
        message: `Welcome aboard, ${user.username}! 🚀`,
        duration: 5000,
      })
    }
  }, [user?.username])

  if (pathname !== '/auth/onboarding' || !mounted) return null

  return (
    <RegisterDialogComponent open={mounted}>
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
    </RegisterDialogComponent>
  )
}
