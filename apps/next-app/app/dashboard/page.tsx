import { Card } from '@js-monorepo/components/ui/card'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpVersion } from '@js-monorepo/version'

const opts = [
  {
    label: 'Manage Users',
    href: 'dashboard/users',
  },
  {
    label: 'See who is currently online',
    href: 'dashboard/online-users',
  },
  {
    label: 'Manage Notifications',
    href: 'dashboard/notifications',
  },
  {
    label: 'Announcements',
    href: 'dashboard/announcements',
  },
  {
    label: 'Subscriptions',
    href: 'dashboard/subscriptions',
  },
  {
    label: 'Contact messages',
    href: 'dashboard/contact-messages',
  },
]

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
        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
          {opts?.map((opt) => (
            <Card
              key={opt.href}
              className="text-center transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-md cursor-pointer border border-border hover:border-primary bg-card"
            >
              <DpNextNavLink className="p-6 block text-foreground hover:text-primary transition-colors" href={opt.href}>
                {opt.label}
              </DpNextNavLink>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
