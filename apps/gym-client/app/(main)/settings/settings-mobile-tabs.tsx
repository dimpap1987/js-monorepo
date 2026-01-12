'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { SETTINGS_NAV_ITEMS } from '../../../lib/routes-config'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function SettingsMobileTabs() {
  const pathname = usePathname()
  const activeTabRef = useRef<HTMLAnchorElement>(null)

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
    <nav className="sm:hidden border-b border-border mb-6">
      <div className="flex items-center overflow-x-auto whitespace-nowrap no-scrollbar">
        {SETTINGS_NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <DpNextNavLink
              key={item.href}
              href={item.href}
              ref={isActive ? activeTabRef : undefined}
              className="flex flex-col items-center justify-center gap-1 p-3 text-foreground-muted flex-shrink-0 min-w-[90px]"
              activeClassName="text-primary border-b-2 border-primary"
            >
              <item.icon className="text-2xl" />
              <span className="text-xs font-medium">{item.label}</span>
            </DpNextNavLink>
          )
        })}
      </div>
    </nav>
  )
}
