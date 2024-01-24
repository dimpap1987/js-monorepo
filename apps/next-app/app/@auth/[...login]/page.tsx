import LoginDialog from './LoginDialog'
import { headers } from 'next/headers'

function LoginPage() {
  const pathname = headers().get('x-pathname')
  const isLoggedInPage = pathname === '/login'

  if (!isLoggedInPage) return null

  return <LoginDialog></LoginDialog>
}

export default LoginPage
