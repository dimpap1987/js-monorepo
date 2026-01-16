'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { AdminTemplateContent, AdminTemplateSideBar, ContainerTemplate } from '@js-monorepo/templates'
import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'
import { ADMIN_NAV_LINKS } from './utils'

function SidebarOpts() {
  return (
    <div className="space-y-2">
      {ADMIN_NAV_LINKS.map(({ href, icon: Icon, label, activeClassName }) => (
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
  )
}

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <section>
      <AdminTemplateSideBar>
        <SidebarOpts />
      </AdminTemplateSideBar>
      <AdminTemplateContent>
        <ContainerTemplate>{children}</ContainerTemplate>
      </AdminTemplateContent>
    </section>
  )
}
