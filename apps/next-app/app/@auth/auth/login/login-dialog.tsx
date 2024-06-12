'use client'
import { authClient } from '@js-monorepo/auth-client'
import { DpLoginDialog } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { UserNavSocial } from '@js-monorepo/navbar'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

function LoginDialog() {
  const router = useRouter()
  const [, setLoaderState] = useLoader()
  const pathname = usePathname()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // this is a hacky way in order to disable a hydration error caused by radix
    setHydrated(true)
    return () => {
      setLoaderState({
        show: false,
      })
    }
  }, [])

  if (pathname !== '/auth/login' || !hydrated) return null

  const triggerLoading = () => {
    setLoaderState({
      show: true,
      message: 'Logging in...',
      description: 'Sit back and relax.',
    })
  }

  const socials: UserNavSocial[] = [
    {
      type: 'github',
      onLogin: async () => {
        triggerLoading()
        authClient.login('github')
      },
    },
    {
      type: 'google',
      onLogin: async () => {
        triggerLoading()
        authClient.login('google')
      },
    },
  ]
  return (
    <DpLoginDialog
      socialConfig={socials}
      onClose={() => {
        router.back()
      }}
    ></DpLoginDialog>
  )
}

export default LoginDialog
