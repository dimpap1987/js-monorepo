'use client'

import { DpLoginButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { AuthRole } from '@js-monorepo/types/auth'
import { MenuItem, hasRoleAccess } from '@js-monorepo/types/menu'
import { cn } from '@js-monorepo/ui/util'
import { ReactNode, forwardRef, useMemo } from 'react'
import './navbar.css'

import { NavUserOptions, NavUserOptionsProps } from './components/nav-user-options'

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

/* ---------------------- NavItem ---------------------- */
const NavItem = ({ item }: { item: MenuItem }) => (
  <li className={cn('text-center text-nowrap relative content-center self-stretch', item.className)}>
    <DpNextNavLink
      className={cn(
        'p-2 h-full flex items-center border-b-2 border-transparent content-center transition-colors',
        item.isAdmin && 'text-primary font-bold'
      )}
      activeClassName="border-primary"
      href={item.href}
    >
      {item.name}
    </DpNextNavLink>
  </li>
)

/* ---------------------- Navbar ---------------------- */
const Navbar = forwardRef<HTMLDivElement, NavbarProps>(
  ({ logo, rightActions, sidebarTrigger, menuItems = [], user, plan, onLogout, navUserOptionsChildren }, ref) => {
    const isLoggedIn = !!user

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
          className="border-b border-border-glass navbar-height overflow-hidden flex items-center shadow-sm w-full px-4 sm:px-6 gap-3 justify-between"
          ref={ref}
        >
          {/* Left Section: Logo + Main Menu Items */}
          <div className="flex items-center gap-4 md:gap-24 self-stretch">
            {/* Logo */}
            {logo}

            {/* Main Menu Items (left side) */}
            <ul className="nav-list-items relative hidden sm:flex font-semibold font-heading items-center gap-1 self-stretch">
              {mainItems.map((item, index) => (
                <NavItem key={`main-${index}`} item={item} />
              ))}
            </ul>
          </div>

          {/* Right Section */}
          <div className="flex items-center self-stretch">
            <section className="hidden sm:flex items-center gap-2 justify-end self-stretch">
              {/* Secondary Menu Items (right side) */}
              <ul className="nav-list-items mr-5 md:mr-12 relative flex font-semibold font-heading items-center gap-1 self-stretch">
                {secondaryItems.map((item, index) => (
                  <NavItem key={`secondary-${index}`} item={item} />
                ))}
              </ul>

              {/* Custom Navbar Items */}
              {rightActions}

              {/* Auth Buttons */}
              {!isLoggedIn ? (
                <DpNextNavLink href="/auth/login">
                  <DpLoginButton />
                </DpNextNavLink>
              ) : (
                <NavUserOptions className="hidden sm:block mt-2" user={user} plan={plan} onLogout={onLogout}>
                  {navUserOptionsChildren}
                </NavUserOptions>
              )}
            </section>

            {/* Sidebar Trigger (Mobile) */}
            {sidebarTrigger && <div className="block sm:hidden">{sidebarTrigger}</div>}
          </div>
        </nav>
      </header>
    )
  }
)

Navbar.displayName = 'Navbar'
export { Navbar }
