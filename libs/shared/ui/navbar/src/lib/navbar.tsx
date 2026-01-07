'use client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { SidebarTrigger } from '@js-monorepo/components/ui/sidebar'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { AuthRole, MenuItem, SessionUserType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import React, { ReactNode, forwardRef, useMemo } from 'react'
import { IoIosSettings } from 'react-icons/io'
import { UserMetadata } from './components/user-metadata'
import { UserOptionsDropdown } from './components/user-options.component'
import './navbar.css'

function NavUserOptions({
  user,
  plan,
  onLogout,
  className,
}: {
  readonly user?: UserNavProps
  readonly plan?: string | null
  readonly onLogout?: () => void
  readonly className?: string
}) {
  const isLoggedIn = !!user

  return (
    isLoggedIn && (
      <UserOptionsDropdown className={className}>
        <UserMetadata
          profileImage={user.profile?.image}
          username={user.username}
          createdAt={user.createdAt}
          plan={plan}
          className="mb-2 border-border border-b select-none"
        ></UserMetadata>

        <DpNextNavLink
          href="/settings"
          className="flex items-center gap-3 justify-start px-4 py-2.5 rounded-xl w-full select-none group transition-all duration-200 hover:bg-secondary"
        >
          <IoIosSettings className="text-xl flex-shrink-0" />
          <span className="text-sm">Settings</span>
        </DpNextNavLink>

        <DpLogoutButton
          className="text-sm"
          onClick={() => {
            onLogout?.()
          }}
        ></DpLogoutButton>
      </UserOptionsDropdown>
    )
  )
}

export interface DpNextNavbarProps {
  readonly children?: ReactNode
  readonly menuItems?: MenuItem[]
  readonly user?: UserNavProps
  readonly plan?: string | null
  readonly onLogout?: () => void
}
export type UserNavProps = Partial<SessionUserType>

export type UserNavSocial = {
  type: 'google' | 'github' | 'facebook'
  onLogin: () => void
}

const DpNextNavbar = forwardRef<HTMLDivElement, DpNextNavbarProps>(
  ({ children, menuItems = [], user, plan, onLogout }, ref) => {
    const isLoggedIn = !!user

    const { logo, navbarItems } = useMemo(() => {
      let logoElement: ReactNode | null = null
      let navbarItemsElement: ReactNode | null = null

      const visit = (node: ReactNode) => {
        React.Children.forEach(node, (child) => {
          if (!React.isValidElement(child)) return
          if (child.type === React.Fragment) {
            visit(child.props.children)
            return
          }

          if (typeof child.type === 'string') return

          const displayName = (child.type as React.ComponentType).displayName
          if (displayName === 'DpLogo') {
            logoElement = child
          } else if (displayName === 'NavbarItems') {
            navbarItemsElement = child
          }
        })
      }

      visit(children)
      return { logo: logoElement, navbarItems: navbarItemsElement }
    }, [children])

    return (
      <header>
        <nav
          className="border-b border-border-glass navbar-height overflow-hidden flex items-center shadow-sm w-full px-4 sm:px-6 gap-3 justify-between"
          ref={ref}
        >
          {logo}
          <ul className="nav-list-items relative hidden sm:flex font-semibold font-heading items-center gap-1 self-stretch">
            {menuItems &&
              menuItems?.length > 0 &&
              menuItems.map((item, index) => (
                <li
                  key={index}
                  className={cn(`text-center text-nowrap relative content-center self-stretch`, item.className)}
                >
                  {(item?.roles?.includes('PUBLIC') ||
                    item?.roles?.some((role) => user?.roles?.includes(role as AuthRole))) && (
                    <DpNextNavLink
                      className="p-2 h-full flex items-center border-b-2 border-transparent content-center"
                      activeClassName="border-primary"
                      href={item.href}
                    >
                      {item.name}
                    </DpNextNavLink>
                  )}
                </li>
              ))}
          </ul>

          <div className="flex items-center">
            <section className="hidden sm:flex items-center gap-4 justify-end">
              <>
                {navbarItems && navbarItems}

                {!isLoggedIn && (
                  <DpNextNavLink href="/auth/login">
                    <DpLoginButton></DpLoginButton>
                  </DpNextNavLink>
                )}
                {user && (
                  <NavUserOptions
                    className="hidden sm:block mt-[0.58rem]"
                    user={user}
                    plan={plan}
                    onLogout={onLogout}
                  />
                )}
              </>
            </section>
            <div className="block sm:hidden">
              <SidebarTrigger />
            </div>
          </div>
        </nav>
      </header>
    )
  }
)

DpNextNavbar.displayName = 'DpNextNavbar'
export { DpNextNavbar }
