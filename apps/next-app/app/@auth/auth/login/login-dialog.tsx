'use client'
import { authClient } from '@js-monorepo/auth-client'
import { DpLoginDialog } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { UserNavSocial } from '@js-monorepo/navbar'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

function LoginDialog() {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()
  const [, setLoaderState] = useLoader()
  const pathname = usePathname()

  if (pathname !== '/auth/login') return null

  const socials: UserNavSocial[] = [
    {
      type: 'github',
      onLogin: async () => {
        setIsOpen(false)
        setLoaderState({
          show: true,
          message: 'Logging in...',
          description: 'Sit back and relax.',
        })
        authClient.login('github')
      },
    },
    {
      type: 'google',
      onLogin: async () => {
        setIsOpen(false)
        setLoaderState({
          show: true,
          message: 'Logging in...',
          description: 'Sit back and relax.',
        })
        authClient.login('google')
      },
    },
  ]
  return (
    <DpLoginDialog
      socialConfig={socials}
      isOpen={isOpen}
      onClose={() => {
        router.back()
      }}
    ></DpLoginDialog>
  )
}

export default LoginDialog
