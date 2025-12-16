'use client'

import { Input } from '@js-monorepo/components/form'
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
            row.updatedUser = Object.keys(rest).length > 0 ? rest : undefined
          }
        }
      }}
    />
  )
}

export { UsernameTableInput }
