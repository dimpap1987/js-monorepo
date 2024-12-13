'use client'

import {
  MultiSelectDropdown,
  OptionType,
} from '@js-monorepo/components/multiselect'
import { UserDropdown } from '@next-app/app/dashboard/notifications/components/types'
import { findUsers } from '@next-app/app/dashboard/notifications/utils'
import { useEffect, useState } from 'react'

const SelectUsersComponent = ({
  selectedUserIds,
  onChange,
  className,
  classNameTrigger,
}: {
  selectedUserIds: number[]
  onChange: (selectedOptions: OptionType[]) => void
  className?: string
  classNameTrigger?: string
}) => {
  const [usersDropDown, setUsersDropDown] = useState<UserDropdown[]>([])

  useEffect(() => {
    findUsers().then((users) =>
      setUsersDropDown(
        users.users?.map((u) => ({ id: u.id, name: u.username }))
      )
    )
  }, [])

  return (
    <MultiSelectDropdown
      className={className}
      classNameTrigger={classNameTrigger}
      options={usersDropDown}
      onChange={onChange}
      prompt="Select users..."
      selectedIds={selectedUserIds}
    />
  )
}

export { SelectUsersComponent }
