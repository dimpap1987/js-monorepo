export const dynamic = 'force-dynamic'

import { findUnregisteredUser } from '@js-monorepo/auth/next/server'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { RegisterDialog } from './register-dialog'

export const metadata: Metadata = {
  title: 'Onboarding 😎',
}

export default async function OnBoardingPage() {
  const unRegisteredUser = await findUnregisteredUser()

  if (!unRegisteredUser?.email) {
    redirect('/')
  }

  return (
    <RegisterDialog
      formInput={{
        email: unRegisteredUser.email,
      }}
      userProfileImage={unRegisteredUser.profileImage}
    ></RegisterDialog>
  )
}
