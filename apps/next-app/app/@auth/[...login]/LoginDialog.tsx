'use client'
import { DpLoginDialog } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { UserNavSocial } from '@js-monorepo/navbar'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next-nprogress-bar'
import { useState } from 'react'

function LoginDialog() {
  const router = useRouter()
  const [, setLoaderState] = useLoader()
  const [isLoading, setLoading] = useState(true)

  // TODO: replace base url
  const socials: UserNavSocial[] = [
    {
      type: 'github',
      onLogin: () => {
        setLoading(false)
        setLoaderState({
          show: true,
          message: 'Logging in...',
          description: 'Sit back and relax',
        })
        signIn('github', {
          callbackUrl: 'http://localhost:3000',
        })
      },
    },
    {
      type: 'google',
      onLogin: () => {
        setLoading(false)
        setLoaderState({
          show: true,
          message: 'Logging in...',
          description: 'Sit back and relax',
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
      isOpen={isLoading}
      onClose={() => {
        router.back()
      }}
    ></DpLoginDialog>
  )
}

export default LoginDialog
