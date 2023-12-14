import { NavLink } from '@js-monorepo/nav-link'
import { ReactNode } from 'react'

function LogoComponent({
  children,
  href,
}: {
  readonly children: ReactNode
  readonly href: string
}) {
  return <NavLink href={href}>{children}</NavLink>
}

LogoComponent.displayName = 'LogoComponent'

export { LogoComponent }
