import React, { ReactNode, useMemo } from 'react'
import LoginButtonComponent from './components/login-button'
import LogoutButtonComponent from './components/logout-button'
import styles from './navbar.module.css'
export interface NavbarProps {
  children?: ReactNode
  menuItems?: MenuItem[]
}
export type MenuItem = {
  name: string
  link: string
}
// TODO move menu and log here
export function NavbarComponent({ children, menuItems }: NavbarProps) {
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

  return (
    <nav>
      <div
        className={`flex justify-between bg-primary-dark text-white w-screen h-14 z-40`}
      >
        <div className="px-5 xl:px-12 py-2 flex w-full items-center">
          {/* options on the left*/}
          {logo}

          {/* options on the center*/}
          {menuItems && menuItems.length > 0 && (
            <ul className="hidden md:flex px-4 mx-auto font-semibold font-heading space-x-12">
              {menuItems.map((item, index) => (
                <li key={index} className={styles.underlineEffect}>
                  <a className="py-2 px-4" href={item.link}>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {/* options on the right*/}
          <div className="hidden md:flex items-center space-x-5 items-center">
            <LoginButtonComponent></LoginButtonComponent>
            {/* when logged in */}
            <label
              htmlFor="userOptionsToggle"
              className="flex items-center hover:text-gray-200 cursor-pointer select-none transition duration-300 ease-in-out hover:scale-125"
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
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </label>
          </div>
        </div>

        {/* Dropdown icon */}
        <label
          htmlFor="menuToggle"
          className="navbar-burger self-center mr-6 md:hidden cursor-pointer select-none py-2 px-4"
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
        </label>
      </div>

      {/* Hidden input to toggle dropdown options */}
      <input
        id="menuToggle"
        type="checkbox"
        className={`${styles.menuToggleChecked} hidden absolute select-none`}
      ></input>
      {/* Dropdown */}
      <div
        className={`dropdownMenu absolute w-52 right-0 p-2 shadow-lg bg-primary-dark text-white z-40 ${styles.dropdownMenu}`}
      >
        {menuItems && menuItems.length > 0 && (
          <ul className="mx-auto font-semibold font-heading">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className="text-center py-2 hover:bg-blue-900 w-full flex justify-center"
              >
                <a href={item.link}>{item.name}</a>
              </li>
            ))}
          </ul>
        )}
        <hr className="my-2" />
        <LoginButtonComponent></LoginButtonComponent>
        <LogoutButtonComponent></LogoutButtonComponent>
      </div>

      {/* User options hidden input*/}
      <input
        id="userOptionsToggle"
        type="checkbox"
        className={`${styles.userOptionsToggleChecked} hidden absolute select-none`}
      ></input>
      {/* User options Dropdown */}
      <div
        className={`dropdownUserOptions absolute w-44 grid grid-cols-2 gap-4 right-0 p-2 shadow-lg bg-primary-dark text-white z-40 ${styles.dropdownUserOptions}`}
      >
        <LoginButtonComponent></LoginButtonComponent>
        <LogoutButtonComponent></LogoutButtonComponent>
      </div>
    </nav>
  )
}

export default NavbarComponent
