import RegisterDialog from './RegisterDialog'

const LOGIN_REDIRECT = process.env.LOGIN_REDIRECT ?? ''

function Register() {
  return (
    <RegisterDialog
      redirectAfterRegister={LOGIN_REDIRECT}
      email="dim.papa@gmail.com"
      uuid="12312321"
    ></RegisterDialog>
  )
}

export default Register
