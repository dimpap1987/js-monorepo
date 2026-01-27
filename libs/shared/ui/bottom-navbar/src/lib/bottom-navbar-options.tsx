'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { cn } from '@js-monorepo/ui/util'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { IconType } from 'react-icons/lib'

interface BottomNavbarItemProps {
  href: string
  label?: string
  children: ReactNode
  /** Custom active check function. Defaults to exact pathname match */
  isActiveCheck?: (pathname: string) => boolean
  className?: string
}

/**
 * Base component for bottom navbar items.
 * Uses fixed dimensions to prevent layout shifts.
 */
function BottomNavbarItem({ href, label, children, isActiveCheck, className }: BottomNavbarItemProps) {
  const pathname = usePathname()
  const isActive = isActiveCheck ? isActiveCheck(pathname) : pathname === href

  return (
    <DpNextNavLink
      href={href}
      className={cn(
        'w-full h-full',
        'flex flex-col items-center justify-center',
        'transition-transform duration-150 ease-out',
        'tap-highlight-transparent active:scale-95',
        isActive && 'border-t-2 border-primary',
        className
      )}
    >
      {/* Icon container - fixed size */}
      <div
        className={cn(
          // Fixed dimensions for icon container
          'w-6 h-6',
          'flex items-center justify-center',
          'relative'
        )}
      >
        {/* Icon with color transition */}
        <div className={cn('w-full h-full', 'transition-colors duration-150')}>{children}</div>
      </div>

      {/* Label */}
      {label && (
        <span
          className={cn(
            'mt-1',
            'text-[10px] font-medium leading-none',
            'transition-colors duration-150',
            'max-w-full truncate'
          )}
        >
          {label}
        </span>
      )}

      {/* Active indicator bar */}
      {isActive && (
        <span className={cn('absolute bottom-0 left-1/2 -translate-x-1/2', 'w-4 h-0.5 rounded-full', 'bg-primary')} />
      )}
    </DpNextNavLink>
  )
}

/**
 * Standard navbar item with an icon
 */
function BottomNavbarOptions({ href, Icon, label }: { href: string; Icon: IconType; label?: string }) {
  return (
    <BottomNavbarItem href={href} label={label}>
      <Icon className="w-full h-full" />
    </BottomNavbarItem>
  )
}

/**
 * Navbar item for notifications/alerts with custom children (e.g., bell with badge)
 */
function BottomNavbarAlert({ href, label, children }: { href: string; label?: string; children: ReactNode }) {
  return (
    <BottomNavbarItem
      href={href}
      label={label}
      isActiveCheck={(pathname) => pathname === href || pathname?.startsWith('/notifications')}
    >
      {children}
    </BottomNavbarItem>
  )
}

export { BottomNavbarAlert, BottomNavbarItem, BottomNavbarOptions }
