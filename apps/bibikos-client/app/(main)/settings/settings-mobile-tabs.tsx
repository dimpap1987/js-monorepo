'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { useHasSubscriptionHistory } from '@js-monorepo/payments-ui'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import { SETTINGS_NAV_ITEMS } from '../../../lib/routes-config'

export function SettingsMobileTabs() {
  const pathname = usePathname()
  const t = useTranslations()
  const activeTabRef = useRef<HTMLAnchorElement>(null)
  const { data: hasSubscriptionHistory = false } = useHasSubscriptionHistory()

  const translatedTabs = useMemo(() => {
    // Filter out subscription item if user doesn't have subscription history
    const items = SETTINGS_NAV_ITEMS.filter((item) => {
      if (item.href === '/settings/subscription') {
        return hasSubscriptionHistory
      }
      return true
    })

    return items.map((item) => ({
      ...item,
      label: t(item.label),
    }))
  }, [t, hasSubscriptionHistory])

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [pathname])

  return (
    <nav className="border-b border-border mb-6">
      <div className="flex items-center overflow-x-auto whitespace-nowrap no-scrollbar scroll-smooth">
        {translatedTabs.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <DpNextNavLink
              key={item.href}
              href={item.href}
              ref={isActive ? activeTabRef : undefined}
              className="flex flex-col items-center justify-center gap-1.5 p-3 text-foreground-muted flex-shrink-0 min-w-[100px] transition-colors"
              activeClassName="text-primary border-b-2 border-primary bg-primary/5"
            >
              <item.icon className="text-xl" />
              <span className="text-[11px] font-semibold tracking-tight truncate max-w-full">{item.label}</span>
            </DpNextNavLink>
          )
        })}
      </div>
    </nav>
  )
}
