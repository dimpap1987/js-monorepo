import LoginDialog from './LoginDialog'

const LOGIN_REDIRECT = process.env.LOGIN_REDIRECT ?? ''

function Login() {
  return <LoginDialog callbackUrl={LOGIN_REDIRECT}></LoginDialog>
}

export default Login
