import { findUnregisteredUser } from '@js-monorepo/auth-server'
import { RegisterDialog } from './register-dialog'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

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
