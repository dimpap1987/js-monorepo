'use client'

import { MenuItem } from '@js-monorepo/types/menu'
import { UserNavProps } from '../navbar'
import { NavItem } from './nav-item'

interface NavMenuListProps {
  items: MenuItem[]
  user?: UserNavProps
  className?: string
}

export const NavMenuList = ({ items, user, className }: NavMenuListProps) => {
  if (items.length === 0) return null

  return (
    <ul className={className}>
      {items.map((item, index) => (
        <NavItem key={`${item.href}-${index}`} item={item} user={user} />
      ))}
    </ul>
  )
}
