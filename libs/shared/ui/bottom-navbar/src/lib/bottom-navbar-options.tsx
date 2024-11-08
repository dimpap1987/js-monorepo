import { DpNextNavLink } from '@js-monorepo/nav-link'
import { IconType } from 'react-icons/lib'

export const BottomNavbarOptions = ({
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
        className="p-2 transition-colors w-full duration-300 grid grid-cols-1 place-items-center gap-2 items-center border-t-2 border-transparent hover:border-accent
                   whitespace-nowrap overflow-hidden"
        href={href}
        activeClassName="border-t-2 border-primary"
      >
        <div className="flex justify-end">
          <Icon size="1.1rem" className="shrink-0" />
        </div>
        <div className="text-xs">{label}</div>
      </DpNextNavLink>
    </div>
  )
}
