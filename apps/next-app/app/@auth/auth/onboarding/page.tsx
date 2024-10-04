import { findUnregisteredUser } from '@js-monorepo/auth/next/server'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { RegisterDialog } from './register-dialog'

export const metadata: Metadata = {
  title: 'Onboarding 😎',
}

export default async function OnBoardingPage() {
  const headers = new Headers()
  cookies()
    .getAll()
    .forEach((cookie) => {
      headers.append('Cookie', `${cookie.name}=${cookie.value}`)
    })

  const unRegisteredUser = await findUnregisteredUser(headers)

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
