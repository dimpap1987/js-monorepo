'use client'

import { AuthUserFullPayload } from '@js-monorepo/types'
import { constructURIQueryString } from '@js-monorepo/utils'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'
import { DataTable, DataTableColumnHeader } from '@js-monorepo/components'

export interface DashboardUsersTableComponentProps {}

interface UsersReponse {
  users: AuthUserFullPayload[]
  totalCount: number
}

const findUsers = async (searchParams?: string) => {
  const response = await fetch(
    `http://localhost:3333/api/admin/users${searchParams}`,
    {
      credentials: 'include',
    }
  )

  if (!response.ok)
    return {
      users: [],
      totalCount: 0,
    }
  return response.json()
}

export const columns: ColumnDef<AuthUserFullPayload>[] = [
  {
    accessorKey: 'profileImage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="" className="w-[20px]" />
    ),
    cell: ({ row }) => (
      <Image
        src={row.original.providers[0]?.profileImage ?? ''}
        width={30}
        height={30}
        alt="Picture of the user"
        className="rounded-full mb-1 mx-auto"
      />
    ),
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID"
        className="min-w-[100%]"
      />
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Username"
        className="w-[100%]"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('username')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Email"
        className="w-[100%]"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'roles',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Roles"
        className="w-[100%]"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('roles')}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Created At"
        className="w-[100%]"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {moment(row.original.createdAt).format('YYYY-MM-DD')}
      </div>
    ),
  },
  {
    accessorKey: 'provider',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Provider" />
    ),
    cell: ({ row }) => (
      <div className="w-[100%] text-center">
        {row.original.providers[0]?.type}
      </div>
    ),
  },
]

const DashboardUsersTableComponent = (
  props: DashboardUsersTableComponentProps
) => {
  const [users, setUsers] = useState<AuthUserFullPayload[] | []>([])
  const searchParams = useSearchParams()
  useEffect(() => {
    const searchQuery = constructURIQueryString(searchParams)
    findUsers(searchQuery).then((data) => {
      setUsers(data.users)
    })
  }, [searchParams])

  return (
    <>
      <DataTable columns={columns} data={users}></DataTable>
    </>
  )
}

export { DashboardUsersTableComponent }
