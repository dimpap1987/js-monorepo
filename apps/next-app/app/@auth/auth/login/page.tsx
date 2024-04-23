import { signin } from '@next-app/actions/signin'
import LoginDialog from './login-dialog'

export default async function Login() {
  return <LoginDialog onLogin={signin}></LoginDialog>
}
