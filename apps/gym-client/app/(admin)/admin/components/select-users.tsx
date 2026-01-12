'use client'

import { MultiSelectDropdown, OptionType } from '@js-monorepo/components/ui/mutli-select'
import { useUsers } from '../users/queries'

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
  const { data: usersData, isLoading } = useUsers()

  const usersDropDown = (usersData?.content ?? []).map((u) => ({ id: u.id, name: u.username }))

  return (
    <MultiSelectDropdown
      className={className}
      classNameTrigger={classNameTrigger}
      options={usersDropDown}
      onChange={onChange}
      prompt={isLoading ? 'Loading users...' : 'Select users...'}
      selectedIds={selectedUserIds}
    />
  )
}

export { SelectUsersComponent }
