'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { useHasSubscriptionHistory } from '@js-monorepo/payments-ui'
import { ContainerTemplate } from '@js-monorepo/templates'
import { cn } from '@js-monorepo/ui/util'
import { useTranslations } from 'next-intl'
import { PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { MdChevronLeft } from 'react-icons/md'
import { SETTINGS_NAV_ITEMS } from '../../../lib/routes-config'

interface SettingsSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

function SettingsSidebar({ isCollapsed, onToggle }: SettingsSidebarProps) {
  const t = useTranslations()
  const { data: hasSubscriptionHistory = false } = useHasSubscriptionHistory()

  const translatedSettingsItems = useMemo(() => {
    const items = SETTINGS_NAV_ITEMS.filter((item) => {
      if (item.href === '/settings/subscription') {
        return hasSubscriptionHistory
      }
      return true
    })

    return items.map((item) => ({
      ...item,
      label: t(item.label),
      description: t(item.description),
    }))
  }, [t, hasSubscriptionHistory])

  return (
    <div>
      <div className="mb-6">
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
      <nav className="space-y-1" aria-label="Settings navigation">
        {translatedSettingsItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.href} className="relative" title={isCollapsed ? item.label : undefined}>
              <DpNextNavLink
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg transition-colors duration-200',
                  'hover:bg-background-secondary text-foreground',
                  isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2.5 border-l-2 border-transparent'
                )}
                activeClassName="bg-accent text-primary font-medium border-l-2 border-primary"
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

export function DesktopSettingsLayout({ children }: PropsWithChildren) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggle = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  return (
    <div className="grid grid-cols-[auto_1fr] gap-0 min-h-[calc(95svh-var(--navbar-height))]">
      <div
        className={cn(
          'flex flex-col justify-between p-2 border-r border-border rounded-md',
          'transition-[width] duration-300 ease-in-out h-min',
          'overflow-hidden',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SettingsSidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
      </div>
      <div className="overflow-y-auto pl-6">
        <ContainerTemplate>{children}</ContainerTemplate>
      </div>
    </div>
  )
}
