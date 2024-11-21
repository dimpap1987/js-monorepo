import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import OnlineUsersTableComponent from './online-users-table'

export default async function OnlineUsersController() {
  return (
    <>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Online Users
        </h1>
      </BackArrowWithLabel>
      <OnlineUsersTableComponent></OnlineUsersTableComponent>
    </>
  )
}
