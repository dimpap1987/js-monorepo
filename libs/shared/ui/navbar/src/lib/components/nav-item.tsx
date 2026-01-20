'use client'

import { MenuItem } from '@js-monorepo/types/menu'
import { hasRoleAccess } from '@js-monorepo/types/menu'
import { AuthRole } from '@js-monorepo/types/auth'
import { useMemo } from 'react'
import { UserNavProps } from '../navbar'
import { NavItemDropdown } from './nav-item-dropdown'
import { NavItemLink } from './nav-item-link'

interface NavItemProps {
  item: MenuItem
  user?: UserNavProps
}

export const NavItem = ({ item, user }: NavItemProps) => {
  // Check if item has accessible children
  const hasAccessibleChildren = useMemo(() => {
    if (!item.children) return false
    const accessible = item.children.filter((child) => hasRoleAccess(child.roles, user?.roles as AuthRole[]))
    return accessible.length > 0
  }, [item.children, user?.roles])

  // Render dropdown if item has accessible children, otherwise render regular link
  if (hasAccessibleChildren) {
    return <NavItemDropdown item={item} user={user} />
  }

  return <NavItemLink item={item} />
}
