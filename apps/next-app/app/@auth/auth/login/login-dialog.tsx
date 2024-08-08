'use client'
import { authClient } from '@js-monorepo/auth-client'
import { DpLoginDialogComponent } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { UserNavSocial } from '@js-monorepo/navbar'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const LOGIN_PATH_NAME = '/auth/login'

function LoginDialog() {
  const router = useRouter()
  const pathname = usePathname()
  const pathnameRef = useRef('/') // Create a ref to store the latest pathname
  const [loaderState, setLoaderState] = useLoader()

  const isDialogOpen = pathname === LOGIN_PATH_NAME

  useEffect(() => {
    // clean loader if exists
    return () => {
      if (loaderState.show) {
        setLoaderState({ show: false })
      }
    }
  }, [])

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
      open={isDialogOpen}
      socialConfig={socials}
      onClose={() => {
        setTimeout(() => {
          if (pathnameRef.current === LOGIN_PATH_NAME) {
            router.back()
          }
        }, 250)
      }}
    ></DpLoginDialogComponent>
  )
}

export default LoginDialog
