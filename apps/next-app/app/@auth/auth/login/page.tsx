import { signin } from '@next-app/actions/signin'
import LoginDialog from './LoginDialog'

async function Login() {
  return <LoginDialog onLogin={signin}></LoginDialog>
}

export default Login
