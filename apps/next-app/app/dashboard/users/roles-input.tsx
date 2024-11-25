'use client'

import { MultiSelectDropdown } from '@js-monorepo/components/multiselect'
import { AuthRoleDTO, AuthUserDto } from '@js-monorepo/types'
import { API } from '@next-app/utils/api-proxy'
import { Row } from '@tanstack/react-table'
import { useEffect, useState } from 'react'

const getRoles = async () => {
  const response = await API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/admin/roles`
  )
    .get()
    .withCredentials()
    .execute()

  if (response.ok) return response.data as AuthRoleDTO[]

  return [] as AuthRoleDTO[]
}

function RolesTableInput({ row }: { row: Row<AuthUserDto> }) {
  const [roles, setRoles] = useState<AuthRoleDTO[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])

  useEffect(() => {
    getRoles().then((fetchedRoles) => {
      setRoles(fetchedRoles)
      const userRoleNames =
        row?.original.userRole?.map(({ role }) => role.name) || []

      const initialSelectedRoles = fetchedRoles
        .filter((role) => userRoleNames.includes(role.name))
        .map((role) => role.id) // Store only the IDs

      setSelectedRoleIds(initialSelectedRoles)
    })
  }, [row])

  return (
    roles && (
      <MultiSelectDropdown
        classNameTrigger="bg-background text-foreground"
        onChange={(localRoles) => {
          row.updatedUser = {
            ...row.updatedUser,
            roles: localRoles.map((role) => ({
              id: role.id,
            })),
          }
        }}
        prompt={row?.original?.userRole?.map((r) => r.role.name).join(',')}
        options={roles}
        selectedIds={selectedRoleIds}
      ></MultiSelectDropdown>
    )
  )
}

export default RolesTableInput
