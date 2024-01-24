'use client'
import { DpLoginDialog } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { UserNavSocial } from '@js-monorepo/navbar'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next-nprogress-bar'

function LoginDialog() {
  const router = useRouter()
  const [, setLoaderState] = useLoader()

  // TODO: replace base url
  const socials: UserNavSocial[] = [
    {
      type: 'github',
      onLogin: () => {
        setLoaderState({ show: true })
        signIn('github', {
          callbackUrl: 'http://localhost:3000',
        })
      },
    },
    {
      type: 'google',
      onLogin: () => {
        setLoaderState({ show: true })
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
