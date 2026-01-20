'use client'

import { ReactNode } from 'react'
import { NavMenuList } from './nav-menu-list'
import { MenuItem } from '@js-monorepo/types/menu'
import { UserNavProps } from '../navbar'

interface NavLeftSectionProps {
  logo?: ReactNode
  mainItems: MenuItem[]
  user?: UserNavProps
}

export const NavLeftSection = ({ logo, mainItems, user }: NavLeftSectionProps) => {
  return (
    <div className="flex items-center gap-4 md:gap-24 self-stretch">
      {/* Logo */}
      {logo}

      {/* Main Menu Items (left side) */}
      <NavMenuList
        items={mainItems}
        user={user}
        className="nav-list-items relative hidden sm:flex font-semibold font-heading items-center gap-1 self-stretch"
      />
    </div>
  )
}
