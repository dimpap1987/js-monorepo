'use client'
import { authClient } from '@js-monorepo/auth/next/client'
import { DpLoginDialogComponent } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { UserNavSocial } from '@js-monorepo/navbar'
import { useRouter } from 'next-nprogress-bar'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

const LOGIN_PATH_NAME = '/auth/login'

function LoginDialog() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pathnameRef = useRef('/') // Create a ref to store the latest pathname
  const { state, setLoaderState } = useLoader()

  // Get callbackUrl from query params (e.g., /auth/login?callbackUrl=/pricing)
  const callbackUrl = searchParams?.get('callbackUrl') || undefined

  const isDialogOpen = pathname === LOGIN_PATH_NAME

  useEffect(() => {
    // clean loader if exists
    return () => {
      if (state.show) {
        setLoaderState({ show: false })
      }
    }
  }, [state.show, setLoaderState])

  useEffect(() => {
    pathnameRef.current = pathname // Update the ref with the latest pathname
  }, [pathname])

  if (!isDialogOpen) return null

  const triggerLoading = () => {
    setLoaderState({
      show: true,
      message: 'Logging in...',
      description: 'Sit back and relax.',
    })
  }

  const socials: UserNavSocial[] = [
    {
      type: 'google',
      onLogin: async () => {
        triggerLoading()
        authClient.login('google', callbackUrl)
      },
    },
    {
      type: 'github',
      onLogin: async () => {
        triggerLoading()
        authClient.login('github', callbackUrl)
      },
    },
    {
      type: 'facebook',
      onLogin: async () => {
        alert('Not provided yet')
      },
    },
    {
      type: 'apple',
      onLogin: async () => {
        alert('Not provided yet')
      },
    },
  ]

  return (
    <DpLoginDialogComponent
      open={isDialogOpen}
      socialConfig={socials}
      onClose={() => {
        setTimeout(() => {
          if (pathnameRef.current === LOGIN_PATH_NAME) {
            router.back()
          }
        }, 450)
      }}
    ></DpLoginDialogComponent>
  )
}

export default LoginDialog
