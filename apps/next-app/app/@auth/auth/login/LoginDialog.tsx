'use client'
import { DpLoginDialog } from '@js-monorepo/dialog'
import { useLoader } from '@js-monorepo/loader'
import { UserNavSocial } from '@js-monorepo/navbar'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

function LoginDialog({ callbackUrl }: { readonly callbackUrl: string }) {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()
  const [, setLoaderState] = useLoader()
  const pathname = usePathname()

  if (pathname !== '/auth/login') return null

  // TODO: replace base url
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
        signIn('github', {
          callbackUrl: callbackUrl,
        })
      },
    },
    {
      type: 'google',
      onLogin: () => {
        setIsOpen(false)
        setLoaderState({
          show: true,
          message: 'Logging in...',
          description: 'Sit back and relax.',
        })
        signIn('google', {
          callbackUrl: callbackUrl,
        })
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
