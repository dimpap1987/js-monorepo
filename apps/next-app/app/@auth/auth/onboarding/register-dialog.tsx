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
      <div className="flex flex-col items-center gap-3 mb-2">
        <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
          {userProfileImage && <AvatarImage src={userProfileImage} alt={`user's picture`}></AvatarImage>}
          <AvatarFallback className="text-lg font-semibold">
            {formInput?.email?.slice(0, 2)?.toUpperCase() || 'A'}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm text-foreground-muted text-center max-w-xs">Welcome! Let's set up your account</p>
      </div>

      <RegisterForm formInput={formInput}></RegisterForm>
    </RegisterDialogComponent>
  )
}
