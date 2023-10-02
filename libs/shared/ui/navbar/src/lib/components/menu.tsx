import { ReactNode } from 'react'

export type MenuItem = {
  name: string
  link: string
}

interface MenuProps {
  menuItems: MenuItem[]
  children?: ReactNode
  className?: string
}

function MenuComponent({ menuItems, children, className }: MenuProps) {
  return (
    <ul
      className={`hidden md:flex px-4 mx-auto font-semibold font-heading space-x-12 ${className}`}
    >
      {menuItems.map((item, index) => (
        <li key={index}>
          <a className="hover:text-gray-200" href={item.link}>
            {item.name}
          </a>
        </li>
      ))}
      {children}
    </ul>
  )
}

MenuComponent.displayName = 'MenuComponent'

export { MenuComponent }
