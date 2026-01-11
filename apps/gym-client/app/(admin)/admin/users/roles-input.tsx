'use client'

import { MultiSelectDropdown } from '@js-monorepo/components/ui/mutli-select'
import { AuthUserDto, AuthUserUpdateDto } from '@js-monorepo/types/auth'
import { Row } from '@tanstack/react-table'
import React, { useEffect, useMemo, useState } from 'react'
import { useRoles } from './roles-queries'

function RolesTableInput({ row }: { row: Row<AuthUserDto> }) {
  const { data: roles = [], isLoading } = useRoles()
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])

  useEffect(() => {
    if (roles.length > 0) {
      const userRoleNames = row?.original.userRole?.map(({ role }) => role.name) || []

      const initialSelectedRoles = roles.filter((role) => userRoleNames.includes(role.name)).map((role) => role.id) // Store only the IDs

      setSelectedRoleIds(initialSelectedRoles)
    }
  }, [roles, row])

  const originalRoleIds = useMemo(() => {
    return (
      (row?.original.userRole
        ?.map(({ role }) => {
          const foundRole = roles.find((r) => r.name === role.name)
          return foundRole?.id
        })
        .filter(Boolean) as number[]) || []
    )
  }, [row, roles])

  if (isLoading) {
    return <div className="text-foreground-muted">Loading...</div>
  }

  return (
    roles.length > 0 && (
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
            if (row.updatedUser) {
              const { roles: unusedRoles, ...rest } = row.updatedUser
              if (Object.keys(rest).length > 0) {
                row.updatedUser = rest as AuthUserUpdateDto
              } else {
                row.updatedUser = undefined
              }
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
