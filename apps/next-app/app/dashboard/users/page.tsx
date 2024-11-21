import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { DashboardUsersTable } from './users-table'

async function UsersDashboardController() {
  return (
    <>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Users Overview
        </h1>
      </BackArrowWithLabel>
      <DashboardUsersTable></DashboardUsersTable>
    </>
  )
}

export default UsersDashboardController
