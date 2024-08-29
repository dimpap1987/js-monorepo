'use client'

import { RegisterDialogComponent } from '@js-monorepo/dialog'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
