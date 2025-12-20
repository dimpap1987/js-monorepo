'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { useDeviceType } from '@js-monorepo/next/hooks'
import { ContainerTemplate } from '@js-monorepo/templates'
import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { IoMdNotifications } from 'react-icons/io'
import { MdAccountCircle, MdChevronLeft, MdPalette } from 'react-icons/md'

interface SettingsNavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const settingsNavItems: SettingsNavItem[] = [
  {
    href: '/settings/account',
    label: 'Account',
    icon: MdAccountCircle,
    description: 'Account information',
  },
  {
    href: '/settings/appearance',
    label: 'Appearance',
    icon: MdPalette,
    description: 'Themes and preferences',
  },
  {
    href: '/settings/notifications',
    label: 'Notifications',
    icon: IoMdNotifications,
    description: 'Push notifications and alerts',
  },
]

interface SettingsSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

function SettingsSidebar({ isCollapsed, onToggle }: SettingsSidebarProps) {
  return (
    <div>
      {/* Header with Collapse Button */}
      <div className="mb-6 hidden sm:block">
        <div className={cn('flex items-center justify-between gap-2 mb-1', isCollapsed && 'justify-center')}>
          <div
            className={cn('overflow-hidden transition-all duration-500 ease-in-out', isCollapsed ? 'hidden' : 'block')}
          >
            <h2 className="text-lg ml-4 font-semibold text-foreground whitespace-nowrap">Settings</h2>
          </div>
          <button
            onClick={onToggle}
            tabIndex={0}
            className={cn(
              'p-1.5 rounded-md transition-all duration-200 shrink-0',
              'hover:bg-background-secondary text-foreground-muted hover:text-foreground',
              'focus:outline-none',
              isCollapsed && 'font-bold bg-background-secondary text-foreground'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <MdChevronLeft
              className={cn('text-xl transition-transform duration-500 ease-in-out', isCollapsed && 'rotate-180')}
            />
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1" aria-label="Settings navigation">
        {settingsNavItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.href} className="relative" title={isCollapsed ? item.label : undefined}>
              <DpNextNavLink
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg transition-colors duration-200',
                  'hover:bg-background-secondary hover:text-foreground text-foreground-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                  isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2.5 border-l-2 border-transparent'
                )}
                activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
              >
                <Icon
                  className={cn(
                    'shrink-0 transition-colors duration-200 text-current group-hover:text-foreground',
                    isCollapsed ? 'text-lg' : 'text-xl'
                  )}
                />
                {!isCollapsed && (
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-foreground-muted mt-0.5 whitespace-nowrap">{item.description}</div>
                    )}
                  </div>
                )}
              </DpNextNavLink>
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default function SettingsLayout({ children }: PropsWithChildren) {
  const { deviceType } = useDeviceType()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isMobile = deviceType === 'mobile'

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }, [isMobile])

  const handleToggle = useCallback(() => {
    if (isMobile) return // Prevent toggling on mobile
    setIsCollapsed((prev) => !prev)
  }, [isMobile])

  return (
    <div className="grid grid-cols-[auto_1fr] gap-0 min-h-[calc(95svh-var(--navbar-height))]">
      {/* Sidebar - First column with dynamic width based on collapsed state */}
      <div
        className={cn(
          'flex flex-col justify-between p-2 border-r border-border rounded-md',
          // Disable transition on mobile to prevent shrinking animation
          isMobile ? '' : 'transition-[width] duration-300 ease-in-out',
          'overflow-hidden',
          isMobile || isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SettingsSidebar isCollapsed={isMobile || isCollapsed} onToggle={handleToggle} />
      </div>

      {/* Content Area - Second column takes remaining space */}
      <div className="p-3 overflow-y-auto sm:pl-6">
        <ContainerTemplate>{children}</ContainerTemplate>
      </div>
    </div>
  )
}
