'use client'

import {
  DataTable,
  DataTableColumnHeader,
  Input,
  usePagination,
} from '@js-monorepo/components'
import { AuthUserFullPayload } from '@js-monorepo/types'
import { constructURIQueryString } from '@js-monorepo/utils'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'
import { useRouter } from 'next-nprogress-bar'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { GrAnnounce } from 'react-icons/gr'
import { MdOutlineModeEditOutline } from 'react-icons/md'
import { TiCancelOutline, TiTick } from 'react-icons/ti'
interface UsersReponse {
  users: AuthUserFullPayload[] | []
  totalCount: number
}

declare module '@tanstack/table-core' {
  interface Row<TData> {
    updatedUser: any
  }
}

const findUsers = async (searchParams?: string) => {
  const response = await fetch(
    `http://localhost:3333/api/admin/users${searchParams}`,
    {
      credentials: 'include',
      cache: 'no-store',
    }
  )

  if (!response.ok)
    return {
      users: [],
      totalCount: 0,
    }
  return response.json() as Promise<UsersReponse>
}

const DashboardUsersTableComponent = () => {
  const [data, setData] = useState<UsersReponse>({ users: [], totalCount: 0 })

  const [update, setUpdate] = useState<{
    index?: number
    inProgress: boolean
    user?: AuthUserFullPayload
  }>()

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
    replace('?' + params)
  }, [pagination, limit, onPaginationChange, skip])

  const pageCount = Math.round(data.totalCount / limit)

  const memoizedColumns: ColumnDef<AuthUserFullPayload>[] = useMemo(
    () => [
      {
        accessorKey: 'profileImage',
        size: 50,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="" />
        ),
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
          const initialValue = row.getValue('username') as string
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [value, setValue] = useState(initialValue)
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            setValue(initialValue)
          }, [initialValue])

          return update?.index === row.index ? (
            <Input
              className="py-1 px-4"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                row.updatedUser = {
                  username: e.target.value,
                }
              }}
            />
          ) : (
            <div className="text-center">{value}</div>
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
        size: 130,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Roles" />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue('roles')}</div>
        ),
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
      {
        accessorKey: 'provider',
        size: 100,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Provider" />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.original.providers[0]?.type}</div>
        ),
      },
      {
        id: 'actions',
        size: 100,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex gap-2 justify-center items-center">
              {update?.inProgress && update.index === row.index ? (
                <>
                  <div className="flex border-zinc-600 border-2 rounded-lg items-center p-1 px-2 gap-2">
                    <TiTick
                      title="Submit"
                      className="shrink-0 text-2xl cursor-pointer transform hover:scale-125 transition duration-300 border rounded-lg"
                      onClick={async () => {
                        const response = await fetch(
                          `${process.env.NEXT_PUBLIC_AUTH_URL}/api/admin/users/${row.original.id}`,
                          {
                            method: 'PUT',
                            credentials: 'include',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              ...row.updatedUser,
                            }),
                          }
                        )
                        if (response.ok) {
                          await response.json()
                          const params = new URLSearchParams(searchParams)
                          params.set('updatedAt', new Date().toLocaleString())
                          replace('?' + params)
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
                </>
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
              <div className="flex justify-center items-center border-2 rounded-lg p-1">
                <GrAnnounce className="shrink-0 text-2xl cursor-pointer" />
              </div>
            </div>
          )
        },
      },
    ],
    [update, replace, searchParams, pagination]
  )

  return (
    <>
      <DataTable
        columns={memoizedColumns}
        data={data.users}
        onPaginationChange={onPaginationChange}
        totalCount={pageCount}
        pagination={pagination}
      ></DataTable>
    </>
  )
}

export { DashboardUsersTableComponent }