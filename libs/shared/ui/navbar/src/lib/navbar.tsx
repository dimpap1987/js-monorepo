'use client'

import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { AuthRole, SessionUserType } from '@js-monorepo/types/auth'
import { MenuItem } from '@js-monorepo/types/menu'
import { cn } from '@js-monorepo/ui/util'
import React, { ReactNode, forwardRef } from 'react'
import { IoIosSettings } from 'react-icons/io'
import { UserMetadata } from './components/user-metadata'
import { UserOptionsDropdown } from './components/user-options.component'
import './navbar.css'

/* ---------------------- User Options ---------------------- */
interface NavUserOptionsProps {
  user: UserNavProps
  plan?: string | null
  onLogout?: () => void
  className?: string
}

const NavUserOptions: React.FC<NavUserOptionsProps> = ({ user, plan, onLogout, className }) => {
  return (
    <UserOptionsDropdown className={className}>
      <UserMetadata
        profileImage={user.profile?.image}
        username={user.username}
        createdAt={user.createdAt}
        plan={plan}
        className="mb-2 border-border border-b select-none"
      />

      <DpNextNavLink
        href="/settings"
        className="flex items-center gap-3 justify-start px-4 py-2.5 rounded-xl w-full select-none group transition-all duration-200 hover:bg-secondary"
      >
        <IoIosSettings className="text-xl flex-shrink-0" />
        <span className="text-sm">Settings</span>
      </DpNextNavLink>

      <DpLogoutButton className="text-sm" onClick={onLogout} role="menuitem" />
    </UserOptionsDropdown>
  )
}

/* ---------------------- Types ---------------------- */
export interface NavbarProps {
  logo?: ReactNode
  rightActions?: ReactNode
  sidebarTrigger?: ReactNode
  menuItems?: MenuItem[]
  user?: UserNavProps
  plan?: string | null
  onLogout?: () => void
}

export type UserNavProps = {
  username: string
  roles: AuthRole[]
  profile?: { image?: string }
  createdAt?: string
}

/* ---------------------- Navbar ---------------------- */
const Navbar = forwardRef<HTMLDivElement, NavbarProps>(
  ({ logo, rightActions, sidebarTrigger, menuItems = [], user, plan, onLogout }, ref) => {
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
              const hasAccess =
                item.roles?.includes('PUBLIC') || item.roles?.some((role) => user?.roles.includes(role as AuthRole))

              if (!hasAccess) return null

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
                <NavUserOptions className="hidden sm:block mt-2" user={user} plan={plan} onLogout={onLogout} />
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
