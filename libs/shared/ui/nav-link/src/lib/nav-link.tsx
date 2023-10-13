import { useRouter } from 'next-nprogress-bar'

export interface NavLinkProps {
  href: string
  children: React.ReactNode
  className: string
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const router = useRouter()
  return (
    <span
      className={className}
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
