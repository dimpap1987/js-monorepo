import { DpNextNavLink } from '@js-monorepo/nav-link'
import { ReactNode } from 'react'
import { IconType } from 'react-icons/lib'

const BottomNavbarOptions = ({
  href,
  Icon,
  label,
}: {
  href: string
  Icon: IconType
  label: string
}) => {
  return (
    <div className="flex flex-col gap-1 justify-center items-center flex-1 h-full">
      <DpNextNavLink
        className="p-2 transition-colors w-full duration-300 grid grid-cols-1 place-items-center gap-2 items-center border-t-2 border-transparent 
                   whitespace-nowrap overflow-hidden h-full"
        href={href}
        activeClassName="border-t-2 border-primary"
      >
        <div className="flex justify-end">
          <Icon className="shrink-0 text-xl" />
        </div>
        <div className="text-xs">{label}</div>
      </DpNextNavLink>
    </div>
  )
}

const BottomNavbarAlert = ({
  href,
  label,
  children,
}: {
  label: string
  href: string
  children: ReactNode
}) => {
  return (
    <div className="flex flex-col gap-1 justify-center items-center flex-1 h-full">
      <DpNextNavLink
        className="p-2 transition-colors w-full duration-300 grid grid-cols-1 place-items-center gap-2 items-center border-t-2 border-transparent
                   whitespace-nowrap overflow-hidden h-full"
        href={href}
        activeClassName="border-t-2 border-primary"
      >
        {children}
        <div className="text-xs">{label}</div>
      </DpNextNavLink>
    </div>
  )
}

export { BottomNavbarAlert, BottomNavbarOptions }
