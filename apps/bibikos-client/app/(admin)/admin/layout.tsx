'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { useDeviceType } from '@js-monorepo/next/hooks'
import { AdminTemplateContent, AdminTemplateSideBar, ContainerTemplate } from '@js-monorepo/templates'
import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'
import { ADMIN_NAV_SECTIONS } from './utils'

function SidebarOpts() {
  return (
    <div className="space-y-4">
      {ADMIN_NAV_SECTIONS.map((section, sectionIndex) => (
        <div key={section.title ?? sectionIndex} className="space-y-2">
          {section.title && (
            <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </div>
          )}
          {section.links.map(({ href, icon: Icon, label, activeClassName }) => (
            <DpNextNavLink
              key={href}
              className={cn(
                'p-2 transition-colors duration-300 grid place-items-center gap-2 items-center border border-border rounded-md hover:ring-2 hover:ring-inset ring-border',
                'grid-cols-[30px_auto]'
              )}
              href={href}
              activeClassName={activeClassName}
            >
              <div className="flex justify-end">
                <Icon className="shrink-0" />
              </div>
              <div className="text-sm">{label}</div>
            </DpNextNavLink>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { deviceType } = useDeviceType()
  const isMobile = deviceType === 'mobile'

  const content = <ContainerTemplate>{children}</ContainerTemplate>

  return (
    <section>
      <AdminTemplateSideBar>
        <SidebarOpts />
      </AdminTemplateSideBar>

      {isMobile ? content : <AdminTemplateContent>{content}</AdminTemplateContent>}
    </section>
  )
}
