'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@js-monorepo/components/avatar'
import { RegisterDialogComponent } from '@js-monorepo/dialog'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RegisterForm } from './register-form'
import { RegisterDialogType } from './types'

export function RegisterDialog({ formInput, userProfileImage }: RegisterDialogType) {
  //hooks
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (pathname !== '/auth/onboarding' || !mounted) return null

  return (
    <RegisterDialogComponent open={mounted}>
      <div className="p-2 flex justify-center">
        <Avatar className="h-20 w-20">
          {userProfileImage && <AvatarImage src={userProfileImage} alt={`user's picture`}></AvatarImage>}
          <AvatarFallback>{formInput?.email?.slice(0, 2)?.toUpperCase() || 'A'}</AvatarFallback>
        </Avatar>
      </div>

      <RegisterForm formInput={formInput}></RegisterForm>
    </RegisterDialogComponent>
  )
}
