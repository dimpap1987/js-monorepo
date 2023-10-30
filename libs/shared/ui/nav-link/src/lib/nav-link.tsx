import { useRouter } from 'next-nprogress-bar'
import { twMerge } from 'tailwind-merge'

export interface NavLinkProps {
  href: string
  children: React.ReactNode
  className: string
  onClick?: () => void
}

export function NavLink({ href, children, className, onClick }: NavLinkProps) {
  const router = useRouter()
  return (
    <span
      className={twMerge(className, 'w-full cursor-pointer')}
      onClick={() => {
        router.push(href)
        // router.back()
        onClick?.()
      }}
    >
      {children}
    </span>
  )
}

export default NavLink
