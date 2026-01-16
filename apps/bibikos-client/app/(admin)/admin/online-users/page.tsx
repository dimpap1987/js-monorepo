import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import OnlineUsersTableComponent from './online-users-table'

export default async function OnlineUsersController() {
  return (
    <>
      <BackArrowWithLabel className="mb-2">
        <h2>Online Users</h2>
      </BackArrowWithLabel>
      <OnlineUsersTableComponent></OnlineUsersTableComponent>
    </>
  )
}
