'use client'

import { DpLoginButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { AuthRole } from '@js-monorepo/types/auth'
import { MenuItem, hasRoleAccess } from '@js-monorepo/types/menu'
import { cn } from '@js-monorepo/ui/util'
import { ReactNode, forwardRef } from 'react'
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

/* ---------------------- Navbar ---------------------- */
const Navbar = forwardRef<HTMLDivElement, NavbarProps>(
  ({ logo, rightActions, sidebarTrigger, menuItems = [], user, plan, onLogout, navUserOptionsChildren }, ref) => {
    const isLoggedIn = !!user

    return (
      <header>
        <nav
          className="border-b border-border-glass navbar-height overflow-hidden flex items-center shadow-sm w-full px-4 sm:px-6 gap-3 justify-between"
          ref={ref}
        >
          {/* Logo */}
          {logo}

          {/* Menu Items */}
          <ul className="nav-list-items relative hidden sm:flex font-semibold font-heading items-center gap-1 self-stretch">
            {menuItems.map((item, index) => {
              if (!hasRoleAccess(item.roles, user?.roles as AuthRole[])) return null

              return (
                <li
                  key={index}
                  className={cn(`text-center text-nowrap relative content-center self-stretch`, item.className)}
                >
                  <DpNextNavLink
                    className="p-2 h-full flex items-center border-b-2 border-transparent content-center"
                    activeClassName="border-primary"
                    href={item.href}
                  >
                    {item.name}
                  </DpNextNavLink>
                </li>
              )
            })}
          </ul>

          {/* Right Section */}
          <div className="flex items-center">
            <section className="hidden sm:flex items-center gap-4 justify-end">
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
