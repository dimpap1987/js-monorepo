import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { DashboardUsersTable } from './users-table'

async function UsersDashboardController() {
  return (
    <>
      <BackArrowWithLabel className="mb-2">
        <h2>Users Overview</h2>
      </BackArrowWithLabel>
      <DashboardUsersTable></DashboardUsersTable>
    </>
  )
}

export default UsersDashboardController
