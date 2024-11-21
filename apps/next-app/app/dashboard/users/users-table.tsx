'use client'

import { DataTable, DataTableColumnHeader } from '@js-monorepo/components/table'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@js-monorepo/components/avatar'
import { usePaginationWithParams } from '@js-monorepo/next/hooks/pagination'
import { AuthUserFullDto, AuthUserUpdateDto } from '@js-monorepo/types'
import { API } from '@next-app/utils/api-proxy'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { MdOutlineModeEditOutline } from 'react-icons/md'
import { TiCancelOutline, TiTick } from 'react-icons/ti'
import RolesTableInput from './roles-input'
import { UsernameTableInput } from './username-input'
interface UsersReponse {
  users: AuthUserFullDto[] | []
  totalCount: number
}

declare module '@tanstack/table-core' {
  interface Row<TData> {
    updatedUser: AuthUserUpdateDto | undefined
  }
}

const findUsers = async (searchParams?: string) => {
  const response = await API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/admin/users${searchParams}`
  )
    .get()
    .withCredentials()
    .execute()

  if (response.ok) return response.data as UsersReponse

  return {
    users: [],
    totalCount: 0,
  }
}

const DashboardUsersTableSuspense = () => {
  const [data, setData] = useState<UsersReponse>({ users: [], totalCount: 0 })
  const [loading, setLoading] = useState(true)

  const [update, setUpdate] = useState<{
    index?: number
    inProgress: boolean
    user?: AuthUserFullDto
  }>()

  const { pagination, searchQuery, setPagination } = usePaginationWithParams()
  const pageCount = Math.round(data?.totalCount / pagination.pageSize)

  function loadUsers() {
    setLoading(true)
    findUsers(searchQuery).then((response) => {
      setData(response)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadUsers()
  }, [searchQuery])

  const memoizedColumns: ColumnDef<AuthUserFullDto>[] = useMemo(
    () => [
      {
        accessorKey: 'profileImage',
        size: 50,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="" />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex justify-center items-center">
              <Avatar className='h-10 w-10"'>
                {row.original?.userProfiles?.[0].profileImage && (
                  <AvatarImage
                    src={row.original?.userProfiles?.[0].profileImage}
                    alt={`${row.original.username} picture`}
                  ></AvatarImage>
                )}
                <AvatarFallback>
                  {row.original.username?.slice(0, 3)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
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
        cell: ({ row }) => (
          <div className="text-center">{row.getValue('id')}</div>
        ),
      },
      {
        accessorKey: 'username',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Username" />
        ),
        cell: ({ row }) => {
          return update?.index === row.index ? (
            <UsernameTableInput row={row} />
          ) : (
            <div className="text-center">{row.original.username}</div>
          )
        },
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue('email')}</div>
        ),
      },
      {
        accessorKey: 'roles',
        size: 140,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Roles" />
        ),
        cell: ({ row }) => {
          return update?.index === row.index ? (
            <RolesTableInput row={row} />
          ) : (
            <div className="text-center">
              {row.original?.userRole?.map((r) => r.role.name).join(', ')}
            </div>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        size: 100,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created At" />
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {moment(row.original.createdAt).format('YYYY-MM-DD')}
          </div>
        ),
      },
      // {
      //   accessorKey: 'provider',
      //   size: 100,
      //   header: ({ column }) => (
      //     <DataTableColumnHeader column={column} title="Provider" />
      //   ),
      //   cell: ({ row }) => (
      //     <div className="text-center">
      //       {row.original?.userProfiles?.[0].providerId}
      //     </div>
      //   ),
      // },
      {
        id: 'actions',
        size: 100,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex gap-2 p-4 justify-center items-center ">
              <div id="update-user">
                {update?.inProgress && update.index === row.index ? (
                  <div className="flex border-zinc-600 border-2 rounded-lg items-center p-1 px-2 gap-2">
                    <TiTick
                      title="Submit"
                      className="shrink-0 text-2xl cursor-pointer transform hover:scale-125 transition duration-300 border rounded-lg"
                      onClick={async () => {
                        const response = await API.url(
                          `${process.env.NEXT_PUBLIC_AUTH_URL}/api/admin/users/${row.original.id}`
                        )
                          .put()
                          .body({ ...row.updatedUser })
                          .withCsrf()
                          .withCredentials()
                          .execute()

                        if (response.ok) {
                          loadUsers()
                          setUpdate({
                            inProgress: false,
                          })
                        }
                      }}
                    />
                    <TiCancelOutline
                      title="Cancel"
                      className="shrink-0 text-2xl cursor-pointer transform hover:scale-125 transition duration-300 border rounded-lg"
                      onClick={async () => {
                        row.updatedUser = undefined
                        setUpdate({
                          inProgress: false,
                        })
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center border-2 rounded-lg p-1">
                    <MdOutlineModeEditOutline
                      title="Edit User"
                      className="shrink-0 text-2xl cursor-pointer "
                      onClick={() => {
                        row.updatedUser = undefined
                        setUpdate({
                          index: row.index,
                          inProgress: true,
                        })
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        },
      },
    ],
    [update, pagination]
  )

  return (
    <div className="mt-4">
      <DataTable
        columns={memoizedColumns}
        data={data?.users}
        onPaginationChange={setPagination}
        totalCount={pageCount}
        pagination={pagination}
        loading={loading}
      ></DataTable>
    </div>
  )
}

function DashboardUsersTable() {
  return (
    <Suspense>
      <DashboardUsersTableSuspense></DashboardUsersTableSuspense>
    </Suspense>
  )
}
export { DashboardUsersTable }
