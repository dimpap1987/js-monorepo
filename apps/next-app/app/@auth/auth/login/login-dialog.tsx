'use client'
import { authClient } from '@js-monorepo/auth-client'
import { DpLoginDialogComponent } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { UserNavSocial } from '@js-monorepo/navbar'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

function LoginDialog() {
  const router = useRouter()
  const [, setLoaderState] = useLoader()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => {
      setLoaderState({
        show: false,
      })
    }
  }, [])

  if (pathname !== '/auth/login' || !mounted) return null

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
    <DpLoginDialogComponent
      open={mounted}
      socialConfig={socials}
      onClose={() => {
        router.back()
      }}
    ></DpLoginDialogComponent>
  )
}

export default LoginDialog
