'use client'
import { useRouter } from 'next-nprogress-bar'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

export interface NavLinkProps {
  readonly href: string
  readonly children: React.ReactNode
  readonly className?: string
  readonly onClick?: () => void
}

export function NavLink({ href, children, className, onClick }: NavLinkProps) {
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

export default NavLink
