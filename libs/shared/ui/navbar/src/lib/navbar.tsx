'use client'
import { DpLoginDialog } from '@js-monorepo/dialog'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpNextSidebar, MenuItem } from '@js-monorepo/sidebar'
import { DpVersion } from '@js-monorepo/version'
import React, { ReactNode, useMemo, useRef, useState } from 'react'
import { GiHamburgerMenu } from 'react-icons/gi'
import { useClickAway } from 'react-use'
import DpLoginButton from './components/login-button'
import DpLogoutButton from './components/logout-button'
import styles from './navbar.module.css'
export interface DpNextNavbarProps {
  readonly children?: ReactNode
  readonly menuItems?: MenuItem[]
  readonly user?: UserNavProps
  readonly socialLogin?: UserNavSocial[]
  readonly onLogout?: () => void
}
export type UserNavProps = {
  username?: string
  isLoggedIn: boolean
}
export type UserNavSocial = {
  type: 'google' | 'github' | 'facebook'
  onLogin: () => void
}

export function DpNextNavbar({
  children,
  menuItems = [],
  user,
  socialLogin,
  onLogout,
}: DpNextNavbarProps) {
  //state
  const [isLoginDialog, setIsLoginDialog] = useState(false)
  const [openSideBar, setOpenSideBar] = useState(false)
  const [
    isDropdownLoggedOptionsRefVisible,
    setIsDropdownLoggedOptionsRefVisible,
  ] = useState(false) // State to show/hide div

  //Ref
  const dropdownLoggedOptionsRef = useRef(null)
  useClickAway(dropdownLoggedOptionsRef, () =>
    setIsDropdownLoggedOptionsRefVisible(false)
  )

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
    <header className="z-40">
      <nav className="bg-background text-white w-full border-b border-border sm:px-8">
        <div className="flex justify-between h-14">
          <div className="px-5 py-2 flex w-full items-center">
            {logo}

            <ul className="hidden md:flex px-4 mx-auto font-semibold font-heading space-x-12">
              {menuItems &&
                menuItems.length > 0 &&
                menuItems.map((item, index) => (
                  <li key={index} className={styles.underlineEffect}>
                    <DpNextNavLink className="py-2 px-4" href={item.href}>
                      {item.name}
                    </DpNextNavLink>
                  </li>
                ))}
            </ul>

            {/* options on the right*/}
            <div className="hidden md:flex items-center gap-4 w-40 justify-end text-center">
              {!user?.isLoggedIn && socialLogin && socialLogin.length > 0 && (
                <DpLoginButton
                  onClick={() => setIsLoginDialog((prev) => !prev)}
                ></DpLoginButton>
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
          <div
            className="navbar-burger self-center md:hidden cursor-pointer select-none py-2 px-4"
            aria-label="user-options"
          >
            <button
              onClick={() => setOpenSideBar((prev) => !prev)}
              className="p-3 border-2 border-border rounded-xl text-2xl"
              aria-label="toggle sidebar"
              tabIndex={0}
            >
              <GiHamburgerMenu />
            </button>
            <DpNextSidebar
              isOpen={openSideBar}
              onClose={() => setOpenSideBar(false)}
              position="right"
              items={menuItems}
            >
              <div className="p-3">
                {!user?.isLoggedIn && socialLogin && socialLogin.length > 0 && (
                  <DpLoginButton
                    className="w-full rounded-none"
                    onClick={() => setIsLoginDialog((prev) => !prev)}
                  ></DpLoginButton>
                )}
                {user?.isLoggedIn && (
                  <DpLogoutButton
                    className="p-3"
                    onClick={() => {
                      onLogout?.()
                      setOpenSideBar(false)
                      setIsDropdownLoggedOptionsRefVisible(false)
                    }}
                  ></DpLogoutButton>
                )}
              </div>
              <div className="p-2">
                <DpVersion></DpVersion>
              </div>
            </DpNextSidebar>
          </div>
        </div>

        {/* User options hidden input*/}
        {isDropdownLoggedOptionsRefVisible && (
          <div
            ref={dropdownLoggedOptionsRef}
            className={`absolute w-44 right-0 bg-zinc-900 border border-border rounded text-white z-40 hidden md:block`}
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
          </div>
        )}

        {socialLogin && socialLogin.length > 0 && (
          <DpLoginDialog
            socialConfig={socialLogin}
            isOpen={isLoginDialog}
            onClose={() => setIsLoginDialog(false)}
          ></DpLoginDialog>
        )}
      </nav>
    </header>
  )
}

export default DpNextNavbar
