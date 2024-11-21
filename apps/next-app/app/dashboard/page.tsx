import { Card } from '@js-monorepo/components/card'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { DpVersion } from '@js-monorepo/version'

export default function DashboardController() {
  return (
    <>
      <h2 className="text-foreground text-center">Weclome to Dashboard</h2>

      <div className="my-3 flex justify-center">
        <DpVersion className="text-base"></DpVersion>
      </div>

      <div className="p-2 flex justify-center font-semibold sm:hidden">
        <div className="space-y-4">
          {/* Users Button */}
          <Card className="text-center transition-transform transform hover:scale-105 cursor-pointer hover:bg-primary grid">
            <DpNextNavLink className="p-6" href="dashboard/users">
              Manage Users
            </DpNextNavLink>
          </Card>

          {/* Online Users Button */}
          <Card className="text-center transition-transform transform hover:scale-105 cursor-pointer hover:bg-primary grid">
            <DpNextNavLink className="p-6" href="dashboard/online-users">
              See who is currently online
            </DpNextNavLink>
          </Card>

          {/* Notifications Button */}
          <Card className="text-center transition-transform transform hover:scale-105 cursor-pointer hover:bg-primary grid">
            <DpNextNavLink className="p-6" href="dashboard/notifications">
              Manage Notifications
            </DpNextNavLink>
          </Card>
        </div>
      </div>
    </>
  )
}
