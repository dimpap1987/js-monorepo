import { LoginDialogComponent } from '@js-monorepo/dialog'
import { NavLink } from '@js-monorepo/nav-link'
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import LoginButtonComponent from './components/login-button'
import LogoutButtonComponent from './components/logout-button'
import styles from './navbar.module.css'
export interface NavbarProps {
  children?: ReactNode
  menuItems?: MenuItem[]
}
export type MenuItem = {
  name: string
  href: string
}

const menuItemsDefault: MenuItem[] = [
  {
    href: '/',
    name: 'Home',
  },
  {
    href: '/about',
    name: 'About',
  },
]

// TODO move menu and log here
export function NavbarComponent({
  children,
  menuItems = menuItemsDefault,
}: NavbarProps) {
  //state
  const [isLoginDialog, setLoginDialog] = useState(false)
  const [
    isDropdownLoggedOptionsRefVisible,
    setIsDropdownLoggedOptionsRefVisible,
  ] = useState(false) // State to show/hide div
  const dropdownLoggedOptionsRef = useRef<HTMLDivElement | null>(null)
  const dropdownIconRef = useRef<SVGSVGElement | null>(null)

  const [isDropdownMenuRefVisible, setIsDropdownMenuRefVisible] =
    useState(false) // State to show/hide div
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null)
  const dropDownMenuIconRef = useRef<HTMLDivElement | null>(null)

  const { logo } = useMemo(() => {
    let logoElement: ReactNode | null = null

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && typeof child.type !== 'string') {
        switch ((child.type as React.ComponentType).displayName) {
          case 'LogoComponent':
            logoElement = child
            break
          default:
            break
        }
      }
    })
    return { logo: logoElement }
  }, [children])

  useEffect(() => {
    // Click handler to check if clicks are outside of the referenced div
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !dropdownLoggedOptionsRef.current?.contains(event.target as Node) &&
        !dropdownIconRef.current?.contains(event.target as Node) &&
        event.target !== dropdownIconRef.current
      ) {
        setIsDropdownLoggedOptionsRefVisible(false)
      }
      if (
        !dropdownMenuRef.current?.contains(event.target as Node) &&
        !dropDownMenuIconRef.current?.contains(event.target as Node) &&
        event.target !== dropdownMenuRef.current
      ) {
        setIsDropdownMenuRefVisible(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    // Cleanup - remove the listener when the component unmounts
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <nav className="z-40 bg-primary-dark text-white w-screen">
      <div className="flex justify-between h-14">
        <div className="px-5 xl:px-12 py-2 flex w-full items-center">
          {logo}

          {menuItems && menuItems.length > 0 && (
            <ul className="hidden md:flex px-4 mx-auto font-semibold font-heading space-x-12">
              {menuItems.map((item, index) => (
                <li key={index} className={styles.underlineEffect}>
                  <NavLink className="py-2 px-4" href={item.href}>
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}

          {/* options on the right*/}
          <div className="hidden md:flex items-center space-x-5 items-center">
            <LoginButtonComponent
              onClick={() => setLoginDialog((prev) => !prev)}
            ></LoginButtonComponent>
            {/* when logged in */}
            <div
              className="flex items-center hover:text-gray-200 cursor-pointer select-none transition duration-300 ease-in-out hover:scale-125"
              onClick={() => {
                setIsDropdownLoggedOptionsRefVisible((prev) => !prev)
              }}
            >
              <svg
                ref={dropdownIconRef}
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
            </div>
          </div>
        </div>

        {/* Dropdown icon */}
        <div
          className="navbar-burger self-center mr-6 md:hidden cursor-pointer select-none py-2 px-4"
          ref={dropDownMenuIconRef}
          onClick={() =>
            setIsDropdownMenuRefVisible(() => !isDropdownMenuRefVisible)
          }
        >
          <svg
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </div>
      </div>

      {isDropdownMenuRefVisible && (
        <div
          className="absolute w-52 right-0 p-2 shadow-lg bg-primary-dark text-white block md:hidden"
          ref={dropdownMenuRef}
        >
          {menuItems && menuItems.length > 0 && (
            <ul className="mx-auto font-semibold font-heading">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className="text-center py-2 hover:bg-blue-900 w-full flex justify-center"
                >
                  <NavLink className="py-2 px-4" href={item.href}>
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
          <hr className="my-2" />
          <LoginButtonComponent
            onClick={() => setLoginDialog((prev) => !prev)}
          ></LoginButtonComponent>
          <LogoutButtonComponent></LogoutButtonComponent>
        </div>
      )}

      {/* User options hidden input*/}
      {isDropdownLoggedOptionsRefVisible && (
        <div
          ref={dropdownLoggedOptionsRef}
          className="absolute w-44 right-0 p-2 shadow-lg bg-primary-dark text-white z-40 hidden md:block"
        >
          <LogoutButtonComponent></LogoutButtonComponent>
        </div>
      )}

      <LoginDialogComponent
        isOpen={isLoginDialog}
        onClose={() => setLoginDialog(false)}
      ></LoginDialogComponent>
    </nav>
  )
}

export default NavbarComponent
