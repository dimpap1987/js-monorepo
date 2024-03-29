'use client'
import { DpLoginButton, DpLogoutButton } from '@js-monorepo/button'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { MenuItem } from '@js-monorepo/sidebar'
import { AnimatePresence, motion } from 'framer-motion'
import React, { ReactNode, forwardRef, useMemo, useRef, useState } from 'react'
import { GiHamburgerMenu } from 'react-icons/gi'
import { useClickAway } from 'react-use'
export interface DpNextNavbarProps {
  readonly children?: ReactNode
  readonly menuItems?: MenuItem[]
  readonly user?: UserNavProps
  readonly onLogout?: () => void
  readonly onSideBarClick?: () => void
}
export type UserNavProps = {
  username?: string | null | undefined
  isLoggedIn: boolean
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
          className="bg-background text-white w-full border-b border-border sm:px-8"
          ref={ref}
        >
          <div className="flex justify-between h-14">
            <div className="px-5 py-2 flex w-full items-center">
              {logo}
              <ul className="hidden md:flex px-4 font-semibold font-heading space-x-6 ml-[14%]">
                {menuItems &&
                  menuItems.length > 0 &&
                  menuItems.map((item, index) => (
                    <li key={index} className="hover:text-secondary">
                      <DpNextNavLink
                        className="py-2 px-4"
                        activeClassName="text-secondary underline-offset-8"
                        href={item.href}
                      >
                        {item.name}
                      </DpNextNavLink>
                    </li>
                  ))}
              </ul>

              {/* options on the right*/}
              <div className="hidden md:flex items-center gap-4 w-50 justify-end text-center flex-1">
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
                      <svg
                        // ref={dropdownIconRef}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 hover:text-gray-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
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
                  className="p-3 border-2 border-border rounded-xl text-2xl"
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
                  exit: { opacity: 0, y: '-100%', zIndex: -1 },
                  transition: { duration: 0.4 },
                }}
                ref={dropdownLoggedOptionsRef}
                className={`absolute w-44 right-0 bg-zinc-900 border border-border rounded text-white z-30 hidden md:block`}
              >
                {user?.isLoggedIn && (
                  <DpLogoutButton
                    className="p-3"
                    onClick={() => {
                      onLogout?.()
                      setIsDropdownLoggedOptionsRefVisible(false)
                    }}
                  ></DpLogoutButton>
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
