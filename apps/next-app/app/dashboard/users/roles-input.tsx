'use client'

import { MultiSelectDropdown } from '@js-monorepo/components/multiselect'
import { AuthRoleDTO, AuthUserDto } from '@js-monorepo/types'
import { apiClient } from '@js-monorepo/utils/http'
import { Row } from '@tanstack/react-table'
import React, { useEffect, useState } from 'react'

const getRoles = async () => {
  const response = await apiClient.get(`/admin/roles`)

  if (response.ok) return response.data as AuthRoleDTO[]

  return [] as AuthRoleDTO[]
}

function RolesTableInput({ row }: { row: Row<AuthUserDto> }) {
  const [roles, setRoles] = useState<AuthRoleDTO[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])

  useEffect(() => {
    getRoles().then((fetchedRoles) => {
      setRoles(fetchedRoles)
      const userRoleNames = row?.original.userRole?.map(({ role }) => role.name) || []

      const initialSelectedRoles = fetchedRoles
        .filter((role) => userRoleNames.includes(role.name))
        .map((role) => role.id) // Store only the IDs

      setSelectedRoleIds(initialSelectedRoles)
    })
  }, [row])

  const originalRoleIds = React.useMemo(() => {
    return row?.original.userRole?.map(({ role }) => {
      const foundRole = roles.find((r) => r.name === role.name)
      return foundRole?.id
    }).filter(Boolean) as number[] || []
  }, [row, roles])

  return (
    roles && (
      <MultiSelectDropdown
        classNameTrigger="bg-background text-foreground"
        onChange={(localRoles) => {
          const newRoleIds = localRoles.map((role) => role.id).sort()
          const originalIds = originalRoleIds.sort()
          
          // Only update if roles actually changed
          const rolesChanged = JSON.stringify(newRoleIds) !== JSON.stringify(originalIds)
          
          if (rolesChanged) {
            row.updatedUser = {
              ...row.updatedUser,
              roles: localRoles.map((role) => ({
                id: role.id,
              })),
            }
          } else {
            // If roles are back to original, remove roles from update
            if (row.updatedUser) {
              const { roles: _, ...rest } = row.updatedUser
              row.updatedUser = Object.keys(rest).length > 0 ? rest : undefined
            }
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
