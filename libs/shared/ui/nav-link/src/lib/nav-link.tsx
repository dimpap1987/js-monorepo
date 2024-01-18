'use client'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

export interface DpNextNavLinkProps {
  readonly href: string
  readonly children: React.ReactNode
  readonly className?: string
  readonly onClick?: () => void
}

export function DpNextNavLink({
  href,
  children,
  className,
  onClick,
}: DpNextNavLinkProps) {
  const router = useRouter()
  const currentPath = usePathname()
  return (
    <button
      className={twMerge(className, 'cursor-pointer')}
      onClick={() => {
        if (`/${href}` === currentPath) {
          router.replace(href)
        } else {
          router.push(href)
        }
        onClick?.()
      }}
      tabIndex={0}
      type="button"
    >
      {children}
    </button>
  )
}

export default DpNextNavLink
