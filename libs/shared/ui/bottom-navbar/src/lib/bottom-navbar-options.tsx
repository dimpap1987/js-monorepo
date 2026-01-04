'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { cn } from '@js-monorepo/ui/util'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { IconType } from 'react-icons/lib'

const BottomNavbarOptions = ({ href, Icon, label }: { href: string; Icon: IconType; label: string }) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <DpNextNavLink
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        'flex-1 h-full min-w-0',
        'px-3 py-2',
        'transition-all duration-200 ease-in-out',
        'active:scale-95',
        'rounded-lg',
        'relative group'
      )}
    >
      <div className="relative flex items-center justify-center">
        <Icon className={cn('shrink-0 text-xl transition-all duration-200', 'group-active:scale-110')} />
        {/* Active indicator dot */}
        {isActive && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-in fade-in duration-200 shadow-sm" />
        )}
      </div>
      <span
        className={cn(
          'text-[10px] font-medium leading-tight truncate w-full text-center',
          'transition-colors duration-200'
        )}
      >
        {label}
      </span>
    </DpNextNavLink>
  )
}

const BottomNavbarAlert = ({ href, label, children }: { label: string; href: string; children: ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href || pathname?.startsWith('/notifications')

  return (
    <DpNextNavLink
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-1',
        'flex-1 h-full min-w-0',
        'px-3 py-2',
        'transition-all duration-200 ease-in-out',
        'text-foreground',
        'active:scale-95',
        'rounded-lg',
        'relative group'
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className={cn('transition-all duration-200', isActive && 'scale-110')}>{children}</div>
        {/* Active indicator dot */}
        {isActive && (
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-in fade-in duration-200" />
        )}
      </div>
      <span
        className={cn(
          'text-[10px] font-medium leading-tight truncate w-full text-center',
          'transition-colors duration-200'
        )}
      >
        {label}
      </span>
    </DpNextNavLink>
  )
}

export { BottomNavbarAlert, BottomNavbarOptions }
