'use client'

import { Input } from '@js-monorepo/components/ui/form'
import { AuthUserUpdateDto } from '@js-monorepo/types'
import { Row } from '@tanstack/react-table'
import React from 'react'

function UsernameTableInput<T>({ row }: { row: Row<T> }) {
  const initialValue = (row.getValue('username') as string) ?? ''
  const [value, setValue] = React.useState(initialValue)
  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <Input
      className="py-1 px-4 bg-background text-foreground text-center"
      value={value}
      onChange={(e) => {
        const newValue = e.target.value
        setValue(newValue)

        // Only update if the value actually changed from the original
        if (newValue !== initialValue) {
          row.updatedUser = {
            ...row.updatedUser,
            username: newValue,
          }
        } else {
          // If value is back to original, remove username from update
          if (row.updatedUser) {
            const { username, ...rest } = row.updatedUser
            if (rest.roles && Array.isArray(rest.roles)) {
              row.updatedUser = rest as AuthUserUpdateDto
            } else {
              row.updatedUser = undefined
            }
          }
        }
      }}
    />
  )
}

export { UsernameTableInput }
