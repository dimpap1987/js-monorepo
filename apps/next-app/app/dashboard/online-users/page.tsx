import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import OnlineUsersTableComponent from './online-users-table'

export default async function OnlineUsersController() {
  return (
    <>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h2 className="text-center sm:text-left">Online Users</h2>
      </BackArrowWithLabel>
      <OnlineUsersTableComponent></OnlineUsersTableComponent>
    </>
  )
}
