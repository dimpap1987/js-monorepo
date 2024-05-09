'use client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { MenuItem, UserJWT } from '@js-monorepo/types'
import React, { ReactNode, forwardRef, useMemo } from 'react'
import { FaCircleUser } from 'react-icons/fa6'
import { GiHamburgerMenu } from 'react-icons/gi'
import { TbUserFilled } from 'react-icons/tb'
import UserMetadata from './components/user-metadata'
import { UserOptionsDropdown } from './components/user-options.component'

export interface DpNextNavbarProps {
  readonly children?: ReactNode
  readonly menuItems?: MenuItem[]
  readonly user?: UserNavProps
  readonly onLogout?: () => void
  readonly onSideBarClick?: () => void
}
export type UserNavProps = Partial<UserJWT> & { isLoggedIn: boolean }

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
          } else if (
            (child.type as React.ComponentType).displayName === 'NavbarItems'
          ) {
            navbarItemsElement = child
          }
        }
      })
      return { logo: logoElement, navbarItems: navbarItemsElement }
    }, [children])

    return (
      <header className="z-20">
        <nav
          className="text-foreground w-full border-b border-border sm:px-8"
          ref={ref}
        >
          <div className="flex justify-between h-14">
            <div className="px-5 py-2 flex w-full items-center">
              {logo}
              <ul className="hidden md:flex px-4 font-semibold font-heading items-center space-x-6 ml-[14%]">
                {menuItems &&
                  menuItems.length > 0 &&
                  menuItems.map((item, index) => (
                    <li
                      key={index}
                      className="hover:text-foreground-hover text-center text-nowrap"
                    >
                      {(item?.roles?.includes('PUBLIC') ||
                        item?.roles?.some((role) =>
                          user?.roles?.includes(role)
                        )) && (
                        <DpNextNavLink
                          className="py-2 px-4"
                          activeClassName="text-foreground-hover underline-offset-8"
                          href={item.href}
                        >
                          {item.name}
                        </DpNextNavLink>
                      )}
                    </li>
                  ))}
              </ul>

              {/* options on the right*/}
              <div className="hidden md:flex items-center gap-4 w-50 justify-end text-center flex-1">
                <section className="flex justify-center items-center gap-3">
                  {navbarItems}
                </section>
                {!user?.isLoggedIn && (
                  <DpNextNavLink href="/auth/login">
                    <DpLoginButton className="rounded-full"></DpLoginButton>
                  </DpNextNavLink>
                )}
                {/* when logged in */}
                {user?.isLoggedIn && (
                  <>
                    {/* {user.username && (
                      <div
                        aria-label="user's username"
                        tabIndex={0}
                        className="text-sm font-bold text-white bg-accent px-3 py-1 rounded-full shadow transition-all duration-300"
                      >
                        {user.username}
                      </div>
                    )} */}

                    <UserOptionsDropdown
                      IconComponent={FaCircleUser}
                      className="w-60 lg:w-80 fixed right-0  mt-4"
                    >
                      {user?.isLoggedIn && (
                        <>
                          <UserMetadata
                            profileImage={user.picture}
                            username={user.username}
                            createdAt={user.createdAt}
                            className="mb-2 border-border border-b"
                          ></UserMetadata>

                          <DpNextNavLink
                            href="/profile"
                            onClick={() => {}}
                            className="flex gap-1 justify-start px-4 py-2 mb-1 w-full hover:shadow-2xl hover:ring-2"
                          >
                            <TbUserFilled className="text-2xl" />
                            <span className="ml-2">Profile</span>
                          </DpNextNavLink>

                          <DpLogoutButton
                            className="text-inherit bg-inherit hover:shadow-inner hover:text-white"
                            onClick={() => {
                              onLogout?.()
                            }}
                          ></DpLogoutButton>
                        </>
                      )}
                    </UserOptionsDropdown>
                  </>
                )}
              </div>
            </div>

            {/* Dropdown icon */}
            {onSideBarClick && (
              <div
                className="navbar-burger self-center md:hidden cursor-pointer select-none py-2 px-4"
                aria-label="user-options"
              >
                <button
                  onClick={onSideBarClick}
                  className="p-2 border-2 border-border rounded-xl"
                  aria-label="toggle sidebar"
                  tabIndex={0}
                >
                  <GiHamburgerMenu />
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>
    )
  }
)

DpNextNavbar.displayName = 'DpNextNavbar'
export { DpNextNavbar }
