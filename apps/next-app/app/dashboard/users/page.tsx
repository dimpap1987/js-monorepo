import { DashboardUsersTable } from '@js-monorepo/dashboard-users'

async function UsersDashboardController() {
  return (
    <>
      <h4 className="mb-4 text-center">Users Overview</h4>
      <DashboardUsersTable></DashboardUsersTable>
    </>
  )
}

export default UsersDashboardController
