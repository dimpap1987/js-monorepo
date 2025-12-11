'use client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { AuthRole, MenuItem, SessionUserType } from '@js-monorepo/types'
import { cn } from '@js-monorepo/ui/util'
import React, { ReactNode, forwardRef, useMemo } from 'react'
import { GiHamburgerMenu } from 'react-icons/gi'
import { IoIosSettings } from 'react-icons/io'
import { UserMetadata } from './components/user-metadata'
import { UserOptionsDropdown } from './components/user-options.component'
import './navbar.css'

function SideBarIcon({ onSideBarClick, className }: { onSideBarClick?: () => void; className?: string }) {
  return (
    onSideBarClick && (
      <div className={cn(`navbar-burger self-center cursor-pointer select-none`, className)} aria-label="user-options">
        <button
          onClick={onSideBarClick}
          className="p-2 border-2 border-border rounded-xl"
          aria-label="toggle sidebar"
          tabIndex={0}
        >
          <GiHamburgerMenu />
        </button>
      </div>
    )
  )
}

function NavUserOptions({
  user,
  onLogout,
  className,
}: {
  readonly user?: UserNavProps
  readonly onLogout?: () => void
  readonly className?: string
}) {
  return (
    user?.isLoggedIn && (
      <UserOptionsDropdown className={className}>
        <UserMetadata
          profileImage={user.profile?.image}
          username={user.username}
          createdAt={user.createdAt}
          className="mb-2 border-border border-b select-none"
        ></UserMetadata>

        <DpNextNavLink
          href="/settings"
          className="flex gap-1 justify-start px-4 py-2 rounded-xl w-full select-none group hover:ring-1 hover:ring-border"
        >
          <IoIosSettings className="text-2xl" />
          <span className="ml-2">Settings</span>
        </DpNextNavLink>

        <DpLogoutButton
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
  readonly onLogout?: () => void
  readonly onSideBarClick?: () => void
}
export type UserNavProps = Partial<SessionUserType> & { isLoggedIn: boolean }

export type UserNavSocial = {
  type: 'google' | 'github' | 'facebook'
  onLogin: () => void
}

const DpNextNavbar = forwardRef<HTMLDivElement, DpNextNavbarProps>(
  ({ children, menuItems = [], user, onLogout, onSideBarClick }, ref) => {
    const { logo, navbarItems } = useMemo(() => {
      let logoElement: ReactNode | null = null
      let navbarItemsElement: ReactNode | null = null
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          if ((child.type as React.ComponentType).displayName === 'DpLogo') {
            logoElement = child
          } else if ((child.type as React.ComponentType).displayName === 'NavbarItems') {
            navbarItemsElement = child
          }
        }
      })
      return { logo: logoElement, navbarItems: navbarItemsElement }
    }, [children])

    return (
      <header>
        <nav
          className="text-foreground border-b border-border navbar-height overflow-hidden flex items-center"
          ref={ref}
        >
          <div className="px-5 flex gap-2 justify-between w-full items-center self-stretch">
            {logo}
            <ul className="nav-list-items relative hidden sm:flex font-semibold font-heading items-center space-x-1 self-stretch">
              {menuItems &&
                menuItems?.length > 0 &&
                menuItems.map((item, index) => (
                  <li
                    key={index}
                    className={cn(`text-center text-nowrap relative content-center self-stretch`, item.className)}
                  >
                    {(item?.roles?.includes('PUBLIC') ||
                      item?.roles?.some((role) => user?.roles?.includes(role as AuthRole))) && (
                      <DpNextNavLink className="p-2" activeClassName="underline-offset-8" href={item.href}>
                        {item.name}
                      </DpNextNavLink>
                    )}
                  </li>
                ))}
            </ul>

            <div>
              <section className="hidden sm:flex items-center gap-3 justify-end text-center">
                <>
                  {navbarItems && navbarItems}

                  {!user?.isLoggedIn && (
                    <DpNextNavLink href="/auth/login">
                      <DpLoginButton></DpLoginButton>
                    </DpNextNavLink>
                  )}
                  {user && <NavUserOptions className="mt-[0.58rem]" user={user} onLogout={onLogout} />}
                </>
              </section>

              <SideBarIcon className="block sm:hidden" onSideBarClick={onSideBarClick}></SideBarIcon>
            </div>
          </div>
        </nav>
      </header>
    )
  }
)

DpNextNavbar.displayName = 'DpNextNavbar'
export { DpNextNavbar }
