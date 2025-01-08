import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { DashboardUsersTable } from './users-table'
import { DynamicHeightTemplate } from '@js-monorepo/templates'

async function UsersDashboardController() {
  return (
    <DynamicHeightTemplate>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h2 className="text-center sm:text-left">Users Overview</h2>
      </BackArrowWithLabel>
      <DashboardUsersTable></DashboardUsersTable>
    </DynamicHeightTemplate>
  )
}

export default UsersDashboardController
