'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { MenuItem } from '@js-monorepo/types/menu'
import { cn } from '@js-monorepo/ui/util'

interface NavItemLinkProps {
  item: MenuItem
}

export const NavItemLink = ({ item }: NavItemLinkProps) => {
  return (
    <li className={cn('text-center text-nowrap relative content-center self-stretch', item.className)}>
      <DpNextNavLink
        className={cn(
          'p-2 h-full flex items-center gap-1.5 border-b-2 border-transparent content-center transition-colors',
          item.isAdmin && 'text-primary font-bold'
        )}
        activeClassName="border-primary"
        href={item.href}
      >
        {item.name}
      </DpNextNavLink>
    </li>
  )
}
