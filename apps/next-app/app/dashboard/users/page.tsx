import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { DashboardUsersTable } from './users-table'

async function UsersDashboardController() {
  return (
    <>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h2 className="text-center sm:text-left">Users Overview</h2>
      </BackArrowWithLabel>
      <DashboardUsersTable></DashboardUsersTable>
    </>
  )
}

export default UsersDashboardController
