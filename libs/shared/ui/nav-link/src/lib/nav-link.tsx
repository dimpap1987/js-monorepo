import { useRouter } from 'next-nprogress-bar'
import { twMerge } from 'tailwind-merge'

export interface NavLinkProps {
  href: string
  children: React.ReactNode
  className: string
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const router = useRouter()
  return (
    <span
      className={twMerge(className, 'w-full cursor-pointer')}
      onClick={() => {
        router.push(href)
        // router.back()
      }}
    >
      {children}
    </span>
  )
}

export default NavLink
