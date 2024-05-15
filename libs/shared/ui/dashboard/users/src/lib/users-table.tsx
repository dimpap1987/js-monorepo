'use client'

import {
  DataTable,
  DataTableColumnHeader,
  usePagination,
} from '@js-monorepo/components'
import { AuthUserFullPayload } from '@js-monorepo/types'
import { constructURIQueryString } from '@js-monorepo/utils'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  return response.json() as Promise<UsersReponse>
}

export const columns: ColumnDef<AuthUserFullPayload>[] = [
  {
    accessorKey: 'profileImage',
    size: 50,
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => {
      return (
        <div className="h-12 flex justify-center items-center">
          {row.original.providers[0]?.profileImage && (
            <Image
              src={row.original.providers[0]?.profileImage}
              width={25}
              height={25}
              alt="Picture of the user"
              className="rounded-full mb-1 mx-auto object-contain"
            />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'id',
    size: 50,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('username')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'roles',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roles" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('roles')}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
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
      <div className="text-center">{row.original.providers[0]?.type}</div>
    ),
  },
]

const DashboardUsersTableComponent = (
  props: DashboardUsersTableComponentProps
) => {
  const [data, setData] = useState<{
    users: AuthUserFullPayload[] | []
    totalCount: number
  }>({ users: [], totalCount: 0 })

  const searchParams = useSearchParams()
  const { replace } = useRouter()

  const { limit, onPaginationChange, skip, pagination } = usePagination({
    pageIndexProps: searchParams.get('page')
      ? Number(searchParams.get('page'))
      : undefined,
    pageSizeProps: searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : undefined,
  })

  useEffect(() => {
    //Avoid being called twice because of the below useEffect setting the pagination
    if (!searchParams.get('page') || !searchParams.get('pageSize')) return
    const searchQuery = constructURIQueryString(pagination)
    findUsers(searchQuery).then((response) => {
      setData(response)
    })
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set('pageSize', pagination.pageSize.toString())
    params.set('page', pagination.pageIndex.toString())
    replace('/dashboard?' + params)
  }, [pagination, limit, onPaginationChange, skip])

  const pageCount = Math.round(data.totalCount / limit)

  return (
    <>
      <DataTable
        columns={columns}
        data={data.users}
        onPaginationChange={onPaginationChange}
        totalCount={pageCount}
        pagination={pagination}
      ></DataTable>
    </>
  )
}

export { DashboardUsersTableComponent }
