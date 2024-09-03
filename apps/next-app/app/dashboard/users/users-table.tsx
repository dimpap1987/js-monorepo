'use client'

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DpDialogContent,
} from '@js-monorepo/components/dialog'

import {
  DataTable,
  DataTableColumnHeader,
  usePagination,
} from '@js-monorepo/components/table'

import { Input } from '@js-monorepo/components/form'
import { TextareaForm } from '@js-monorepo/components/textarea'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@js-monorepo/components/avatar'
import { AuthUserFullDto } from '@js-monorepo/types'
import { constructURIQueryString } from '@js-monorepo/ui/util'
import { API } from '@next-app/api-proxy'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'
import { useRouter } from 'next-nprogress-bar'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { GrAnnounce } from 'react-icons/gr'
import { MdOutlineModeEditOutline } from 'react-icons/md'
import { TiCancelOutline, TiTick } from 'react-icons/ti'
interface UsersReponse {
  users: AuthUserFullDto[] | []
  totalCount: number
}

declare module '@tanstack/table-core' {
  interface Row<TData> {
    updatedUser: any
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

  const [update, setUpdate] = useState<{
    index?: number
    inProgress: boolean
    user?: AuthUserFullDto
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

  const pageCount = Math.round(data?.totalCount / limit)

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
            <div className="h-12 flex justify-center items-center">
              <Avatar>
                {row.original.providers[0]?.profileImage && (
                  <AvatarImage
                    src={row.original.providers[0]?.profileImage}
                    alt={`${row.original.username} picture`}
                  ></AvatarImage>
                )}
                <AvatarFallback>
                  {row.original.username?.slice(0, 2)?.toUpperCase() || 'A'}
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
                        const response = await API.url(
                          `${process.env.NEXT_PUBLIC_AUTH_URL}/api/admin/users/${row.original.id}`
                        )
                          .put()
                          .body({ ...row.updatedUser })
                          .withCsrf()
                          .withCredentials()
                          .execute()

                        if (response.ok) {
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
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex justify-center items-center border-2 rounded-lg p-1">
                    <GrAnnounce className="shrink-0 text-2xl cursor-pointer" />
                  </div>
                </DialogTrigger>
                <DpDialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Send notification to &apos;{row.original?.username}&apos;
                    </DialogTitle>
                  </DialogHeader>
                  <TextareaForm
                    submitCallBack={async (callBackData) => {
                      const response = await API.url(
                        `${process.env.NEXT_PUBLIC_AUTH_URL}/api/admin/notification/emit`
                      )
                        .post()
                        .body({
                          channel: row.original?.username,
                          message: callBackData.notification,
                        })
                        .withCsrf()
                        .withCredentials()
                        .execute()

                      if (response.ok) {
                        console.log('Announcement sent')
                      }
                    }}
                  ></TextareaForm>
                </DpDialogContent>
              </Dialog>
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
        data={data?.users}
        onPaginationChange={onPaginationChange}
        totalCount={pageCount}
        pagination={pagination}
      ></DataTable>
    </>
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
