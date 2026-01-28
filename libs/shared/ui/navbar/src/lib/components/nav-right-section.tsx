'use client'

import { ReactNode } from 'react'
import { NavMenuList } from './nav-menu-list'
import { NavAuthSection } from './nav-auth-section'
import { MenuItem } from '@js-monorepo/types/menu'
import { UserNavProps } from '../navbar'
import { NavUserOptionsProps } from './nav-user-options'

interface NavRightSectionProps {
  secondaryItems: MenuItem[]
  user?: UserNavProps
  plan?: string | null
  onLogout?: () => void
  navUserOptionsChildren?: NavUserOptionsProps['children']
  rightActions?: ReactNode
  sidebarTrigger?: ReactNode
}

export const NavRightSection = ({
  secondaryItems,
  user,
  plan,
  onLogout,
  navUserOptionsChildren,
  rightActions,
  sidebarTrigger,
}: NavRightSectionProps) => {
  return (
    <div className="flex items-center self-stretch">
      <section className="hidden sm:flex items-center gap-2 justify-end self-stretch">
        {/* Secondary Menu Items (right side) */}
        <NavMenuList
          items={secondaryItems}
          user={user}
          className="hidden lg:flex mr-4 md:mr-8 relative font-semibold font-heading items-center gap-1 self-stretch"
        />

        <NavAuthSection
          user={user}
          plan={plan}
          onLogout={onLogout}
          navUserOptionsChildren={navUserOptionsChildren}
          rightActions={rightActions}
        />
      </section>

      {/* Sidebar Trigger (Mobile) */}
      {sidebarTrigger && <div className="block sm:hidden">{sidebarTrigger}</div>}
    </div>
  )
}
