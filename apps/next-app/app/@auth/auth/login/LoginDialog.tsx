'use client'
import { DpLoginDialog } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { UserNavSocial } from '@js-monorepo/navbar'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'

function LoginDialog() {
  const router = useRouter()
  const [, setLoaderState] = useLoader()
  const pathname = usePathname()

  if (pathname !== '/auth/login') return null

  // TODO: replace base url
  const socials: UserNavSocial[] = [
    {
      type: 'github',
      onLogin: async () => {
        setLoaderState({
          show: true,
          message: 'Logging in...',
          description: 'Sit back and relax.',
        })
        signIn('github', {
          callbackUrl: 'http://localhost:3000',
        })
      },
    },
    {
      type: 'google',
      onLogin: () => {
        setLoaderState({
          show: true,
          message: 'Logging in...',
          description: 'Sit back and relax.',
        })
        signIn('google', {
          callbackUrl: 'http://localhost:3000',
        })
      },
    },
  ]
  return (
    <DpLoginDialog
      socialConfig={socials}
      isOpen={true}
      onClose={() => {
        router.back()
      }}
    ></DpLoginDialog>
  )
}

export default LoginDialog
