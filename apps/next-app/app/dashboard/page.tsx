import { Card } from '@js-monorepo/components/card'
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
]

export default function DashboardController() {
  return (
    <>
      <h2 className="text-foreground text-center">Weclome to Dashboard</h2>

      <div className="my-3 flex justify-center">
        <DpVersion className="text-base"></DpVersion>
      </div>

      <div className="p-2 flex justify-center font-semibold sm:hidden">
        <div className="space-y-4">
          {opts?.map((opt) => (
            <Card
              key={opt.href}
              className="text-center transition-transform transform hover:scale-105 cursor-pointer bg-white text-black grid"
            >
              <DpNextNavLink className="p-6" href={opt.href}>
                {opt.label}
              </DpNextNavLink>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
