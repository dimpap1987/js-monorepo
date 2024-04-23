'use client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { MenuItem } from '@js-monorepo/sidebar'
import { ModeToggle } from '@js-monorepo/theme-provider'
import { AnimatePresence, motion } from 'framer-motion'
import React, { ReactNode, forwardRef, useMemo, useRef, useState } from 'react'
import { FaCircleUser } from 'react-icons/fa6'
import { GiHamburgerMenu } from 'react-icons/gi'
import { TbUserFilled } from 'react-icons/tb'
import { useClickAway } from 'react-use'
import UserMetadata from './components/user-metadata'

export interface DpNextNavbarProps {
  readonly children?: ReactNode
  readonly menuItems?: MenuItem[]
  readonly user?: UserNavProps
  readonly onLogout?: () => void
  readonly onSideBarClick?: () => void
}
export type UserNavProps = {
  username?: string
  isLoggedIn: boolean
  userProfileImage?: string
  createdAt?: string
}

export type UserNavSocial = {
  type: 'google' | 'github' | 'facebook'
  onLogin: () => void
}

const DpNextNavbar = forwardRef<HTMLDivElement, DpNextNavbarProps>(
  ({ children, menuItems = [], user, onLogout, onSideBarClick }, ref) => {
    //state
    const [
      isDropdownLoggedOptionsRefVisible,
      setIsDropdownLoggedOptionsRefVisible,
    ] = useState(false) // State to show/hide div

    //Refs
    const dropdownLoggedOptionsRef = useRef(null)
    const userProfileIconRef = useRef(null)

    useClickAway(dropdownLoggedOptionsRef, (event) => {
      const target = event.target as Node
      const userProf = userProfileIconRef.current! as Node
      if (userProf?.contains(target)) return

      setIsDropdownLoggedOptionsRefVisible(false)
    })

    const { logo } = useMemo(() => {
      let logoElement: ReactNode | null = null
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          if ((child.type as React.ComponentType).displayName === 'DpLogo') {
            logoElement = child
          }
        }
      })
      return { logo: logoElement }
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
                      <DpNextNavLink
                        className="py-2 px-4"
                        activeClassName="text-foreground-hover underline-offset-8"
                        href={item.href}
                      >
                        {item.name}
                      </DpNextNavLink>
                    </li>
                  ))}
              </ul>

              {/* options on the right*/}
              <div className="hidden md:flex items-center gap-4 w-50 justify-end text-center flex-1">
                <ModeToggle></ModeToggle>
                {!user?.isLoggedIn && (
                  <DpNextNavLink href="/auth/login">
                    <DpLoginButton className="rounded-full"></DpLoginButton>
                  </DpNextNavLink>
                )}
                {/* when logged in */}
                {user?.isLoggedIn && (
                  <>
                    {user.username && (
                      <div className="text-sm font-bold text-white bg-accent px-3 py-1 rounded-full shadow transition-all duration-300">
                        {user.username}
                      </div>
                    )}
                    <button
                      ref={userProfileIconRef}
                      className="cursor-pointer select-none scale-125"
                      aria-label="open-user-options"
                      onClick={() => {
                        setIsDropdownLoggedOptionsRefVisible((prev) => !prev)
                      }}
                      tabIndex={0}
                    >
                      <FaCircleUser className="text-xl" />
                    </button>
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

          {/* User options hidden input*/}
          <AnimatePresence mode="wait" initial={false}>
            {isDropdownLoggedOptionsRefVisible && (
              <motion.div
                {...{
                  initial: { opacity: 0, y: 0 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 0, zIndex: -1 },
                  transition: { duration: 0.4 },
                }}
                ref={dropdownLoggedOptionsRef}
                className={`absolute w-60 lg:w-80 right-0 p-1 border border-border rounded-xl text-foreground z-30 hidden md:block shadow-2xl bg-background-primary text-foreground`}
              >
                {user?.isLoggedIn && (
                  <>
                    {/* User information */}
                    <UserMetadata
                      profileImage={user.userProfileImage}
                      username={user.username}
                      createdAt={user.createdAt}
                      className="mb-2 border-border border-b"
                    ></UserMetadata>

                    {/* Profile */}
                    <DpNextNavLink
                      href="/profile"
                      onClick={() => {
                        setIsDropdownLoggedOptionsRefVisible(false)
                      }}
                      className="flex gap-1 justify-start px-4 py-2 mb-1 w-full hover:shadow-2xl hover:ring-2"
                    >
                      <TbUserFilled className="text-2xl" />
                      <span>Profile</span>
                    </DpNextNavLink>

                    {/* Logout */}
                    <DpLogoutButton
                      className="text-inherit bg-inherit hover:shadow-inner hover:text-white"
                      onClick={() => {
                        onLogout?.()
                        setIsDropdownLoggedOptionsRefVisible(false)
                      }}
                    ></DpLogoutButton>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
    )
  }
)

DpNextNavbar.displayName = 'DpNextNavbar'
export { DpNextNavbar }
