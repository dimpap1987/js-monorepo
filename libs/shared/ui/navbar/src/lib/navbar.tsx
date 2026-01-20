'use client'

import { AuthRole } from '@js-monorepo/types/auth'
import { MenuItem, hasRoleAccess } from '@js-monorepo/types/menu'
import { ReactNode, forwardRef, useMemo } from 'react'
import './navbar.css'

import { NavUserOptionsProps } from './components/nav-user-options'
import { NavLeftSection } from './components/nav-left-section'
import { NavRightSection } from './components/nav-right-section'

/* ---------------------- Types ---------------------- */
export interface NavbarProps {
  logo?: ReactNode
  rightActions?: ReactNode
  sidebarTrigger?: ReactNode
  menuItems?: MenuItem[]
  user?: UserNavProps
  plan?: string | null
  onLogout?: () => void
  navUserOptionsChildren?: NavUserOptionsProps['children']
}

export type UserNavProps = {
  username: string
  roles: AuthRole[]
  profile?: { image?: string }
  createdAt?: string
}

/* ---------------------- Navbar ---------------------- */
const Navbar = forwardRef<HTMLDivElement, NavbarProps>(
  ({ logo, rightActions, sidebarTrigger, menuItems = [], user, plan, onLogout, navUserOptionsChildren }, ref) => {
    // Split items by position and filter by role access
    const { mainItems, secondaryItems } = useMemo(() => {
      const accessible = menuItems.filter((item) => hasRoleAccess(item.roles, user?.roles as AuthRole[]))
      return {
        mainItems: accessible.filter((item) => item.position !== 'secondary'),
        secondaryItems: accessible.filter((item) => item.position === 'secondary'),
      }
    }, [menuItems, user?.roles])

    return (
      <header>
        <nav
          className="border-b text-sm border-border-glass navbar-height overflow-hidden flex items-center shadow-sm w-full px-4 sm:px-6 gap-3 justify-between"
          ref={ref}
        >
          <NavLeftSection logo={logo} mainItems={mainItems} user={user} />
          <NavRightSection
            secondaryItems={secondaryItems}
            user={user}
            plan={plan}
            onLogout={onLogout}
            navUserOptionsChildren={navUserOptionsChildren}
            rightActions={rightActions}
            sidebarTrigger={sidebarTrigger}
          />
        </nav>
      </header>
    )
  }
)

Navbar.displayName = 'Navbar'
export { Navbar }
