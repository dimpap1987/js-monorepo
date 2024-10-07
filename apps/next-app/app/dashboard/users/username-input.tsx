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
      className="py-1 px-4 bg-background-primary text-foreground text-center"
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        row.updatedUser = {
          username: e.target.value,
        }
      }}
    />
  )
}

export { UsernameTableInput }
