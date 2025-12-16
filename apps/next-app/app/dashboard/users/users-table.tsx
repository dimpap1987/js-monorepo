'use client'

import { DataTable, DataTableColumnHeader } from '@js-monorepo/components/table'

import { Avatar, AvatarFallback, AvatarImage } from '@js-monorepo/components/avatar'
import { usePaginationWithParams } from '@js-monorepo/next/hooks/pagination'
import { useNotifications } from '@js-monorepo/notification'
import { AuthUserFullDto, AuthUserUpdateDto, Pageable } from '@js-monorepo/types'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'
import { Dispatch, SetStateAction, Suspense, useCallback, useMemo, useState } from 'react'
import { MdOutlineModeEditOutline } from 'react-icons/md'
import { TiCancelOutline, TiTick } from 'react-icons/ti'
import RolesTableInput from './roles-input'
import { UsernameTableInput } from './username-input'
import { useUsers, useUpdateUser } from './queries'

declare module '@tanstack/table-core' {
  interface Row<TData> {
    updatedUser: AuthUserUpdateDto | undefined
  }
}

const DashboardUsersTableSuspense = () => {
  const { addNotification } = useNotifications()
  const { pagination, searchQuery, setPagination } = usePaginationWithParams()

  const { data, isLoading, refetch } = useUsers(searchQuery)
  const updateUserMutation = useUpdateUser()

  const [update, setUpdate] = useState<{
    index?: number
    inProgress: boolean
    user?: AuthUserFullDto
  }>()

  const pageCount = Math.round((data?.totalCount || 0) / pagination.pageSize)

  const memoizedColumns: ColumnDef<AuthUserFullDto>[] = useMemo(
    () => [
      {
        accessorKey: 'profileImage',
        size: 50,
        header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
        cell: ({ row }) => {
          return (
            <div className="flex justify-center items-center select-none">
              <Avatar className="h-12 w-12">
                {row.original?.userProfiles?.[0]?.profileImage && (
                  <AvatarImage
                    src={row.original?.userProfiles?.[0]?.profileImage}
                    alt={`${row.original.username} picture`}
                  ></AvatarImage>
                )}
                <AvatarFallback>{row.original.username?.slice(0, 3)?.toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
            </div>
          )
        },
      },
      {
        accessorKey: 'id',
        size: 50,
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({ row }) => <div className="text-center">{row.getValue('id')}</div>,
      },
      {
        accessorKey: 'username',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => <div className="text-center">{row.getValue('email')}</div>,
      },
      {
        accessorKey: 'roles',
        size: 140,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Roles" />,
        cell: ({ row }) => {
          return update?.index === row.index ? (
            <RolesTableInput row={row} />
          ) : (
            <div className="text-center">{row.original?.userRole?.map((r) => r.role.name).join(', ')}</div>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        size: 100,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => <div className="text-center">{moment(row.original.createdAt).format('YYYY-MM-DD')}</div>,
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
        cell: ({ row }) => {
          return (
            <div className="flex gap-2 p-4 justify-center items-center select-none">
              <div id="update-user">
                {update?.inProgress && update.index === row.index ? (
                  <div className="flex items-center gap-3 bg-background-secondary">
                    <button
                      title="Submit"
                      className="h-9 w-9 p-0 rounded-md bg-status-success text-status-success-foreground hover:bg-status-success/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-success/50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={updateUserMutation.isPending}
                      onClick={async () => {
                        const updateData = row.updatedUser

                        // Check if there's actually something to update
                        if (!updateData || (!updateData.username && !updateData.roles)) {
                          setUpdate({
                            inProgress: false,
                          })
                          return
                        }

                        try {
                          await updateUserMutation.mutateAsync({
                            userId: row.original.id,
                            data: { ...updateData },
                          })

                          addNotification({
                            message: 'User updated successfully',
                            type: 'success',
                          })

                          await refetch()

                          setUpdate({
                            inProgress: false,
                          })
                        } catch (err: any) {
                          addNotification({
                            message:
                              err?.errors?.map((error: { message: string }) => error.message).join(', ') ||
                              'Failed to update user',
                            type: 'error',
                          })
                        }
                      }}
                    >
                      <TiTick className="text-xl" />
                    </button>
                    <button
                      title="Cancel"
                      className="h-9 w-9 p-0 rounded-md bg-status-error text-status-error-foreground hover:bg-status-error/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-error/50 flex items-center justify-center"
                      onClick={async () => {
                        row.updatedUser = undefined
                        setUpdate({
                          inProgress: false,
                        })
                      }}
                    >
                      <TiCancelOutline className="text-xl" />
                    </button>
                  </div>
                ) : (
                  <button
                    title="Edit User"
                    className="h-9 w-9 p-0 rounded-md border border-border bg-background hover:bg-accent hover:border-accent text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 flex items-center justify-center"
                    onClick={() => {
                      row.updatedUser = undefined
                      setUpdate({
                        index: row.index,
                        inProgress: true,
                      })
                    }}
                  >
                    <MdOutlineModeEditOutline className="text-xl" />
                  </button>
                )}
              </div>
            </div>
          )
        },
      },
    ],
    [update, addNotification, updateUserMutation, refetch]
  )

  const onPaginationChange = useCallback<Dispatch<SetStateAction<{ pageSize: number; pageIndex: number }>>>(
    (newPaginationOrUpdater) => {
      setPagination((prevPagination: Pageable) => {
        const currentState = {
          pageSize: prevPagination.pageSize,
          pageIndex: prevPagination.page,
        }

        const updated =
          typeof newPaginationOrUpdater === 'function' ? newPaginationOrUpdater(currentState) : newPaginationOrUpdater

        return {
          pageSize: updated.pageSize,
          page: updated.pageIndex + 1, // Convert back to one-based for API
        }
      })
    },
    [setPagination]
  )

  return (
    <div>
      <DataTable
        columns={memoizedColumns}
        data={data?.users || []}
        onPaginationChange={onPaginationChange}
        totalCount={pageCount}
        pagination={pagination}
        loading={isLoading}
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
