import { findUnregisteredUser } from '@js-monorepo/auth-server'
import { RegisterDialog } from './register-dialog'
import { redirect } from 'next/navigation'

export default async function OnBoardingPage() {
  const unRegisteredUser = await findUnregisteredUser()

  if (!unRegisteredUser.email) {
    redirect('/')
  }
  return (
    <RegisterDialog
      formInput={{
        email: unRegisteredUser.email,
      }}
    ></RegisterDialog>
  )
}
