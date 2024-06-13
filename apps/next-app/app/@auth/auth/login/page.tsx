import { Metadata } from 'next'
import LoginDialog from './login-dialog'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default async function Login() {
  return <LoginDialog></LoginDialog>
}
