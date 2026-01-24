import { Card } from '@js-monorepo/components/ui/card'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpVersion } from '@js-monorepo/version'
import { ADMIN_NAV_SECTIONS } from './utils'

export default function DashboardController() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Welcome to Dashboard</h1>
        <p className="text-sm text-foreground-muted">Manage your application from here</p>
      </div>

      <div className="flex justify-center">
        <DpVersion className="text-sm text-foreground-neutral"></DpVersion>
      </div>

      <div className="p-2 flex justify-center font-semibold sm:hidden">
        <div className="w-full max-w-md space-y-6">
          {ADMIN_NAV_SECTIONS.map((section, sectionIndex) => (
            <div key={section.title ?? sectionIndex} className="space-y-3">
              {section.title && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  {section.title}
                </h3>
              )}
              <div className="grid grid-cols-1 gap-3">
                {section.links.map(({ href, label }) => (
                  <Card
                    key={href}
                    className="text-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-md cursor-pointer border border-border hover:border-primary bg-card"
                  >
                    <DpNextNavLink
                      className="p-6 block text-foreground hover:text-primary transition-colors"
                      href={href}
                    >
                      {label}
                    </DpNextNavLink>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
