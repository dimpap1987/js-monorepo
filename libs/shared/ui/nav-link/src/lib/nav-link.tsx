'use client'
import { useRouter } from 'next-nprogress-bar'
import { twMerge } from 'tailwind-merge'

export interface NavLinkProps {
  readonly href: string
  readonly children: React.ReactNode
  readonly className?: string
  readonly onClick?: () => void
}

export function NavLink({ href, children, className, onClick }: NavLinkProps) {
  const router = useRouter()
  return (
    <button
      className={twMerge(className, 'cursor-pointer')}
      onClick={() => {
        router.push(href)
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
