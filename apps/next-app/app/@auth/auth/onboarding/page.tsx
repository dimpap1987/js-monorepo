import { RegisterDialog } from './register-dialog'

export default async function OnBoardingPage() {
  return (
    <RegisterDialog
      formInput={{
        email: 'dim@pap.com',
      }}
      registerUrl="http://localhost:3333/api/auth/register"
    ></RegisterDialog>
  )
}
