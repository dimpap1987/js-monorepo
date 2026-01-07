'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { DataTable, DataTableColumnHeader } from '@js-monorepo/components/table'
import { usePaginationWithParams, useTimezone } from '@js-monorepo/next/hooks'
import { useNotifications } from '@js-monorepo/notification'
import { ContactCategory, ContactMessageDto, ContactStatus, Pageable } from '@js-monorepo/types'
import { formatForUser } from '@js-monorepo/utils/date'
import { ColumnDef } from '@tanstack/react-table'
import { Dispatch, SetStateAction, Suspense, useCallback, useMemo, useState } from 'react'
import { FaEnvelope, FaEnvelopeOpen, FaArchive, FaTrash, FaEye, FaSync } from 'react-icons/fa'
import { useContactMessages, useUpdateContactStatus, useDeleteContactMessage } from './queries'
import { ContactMessageDialog } from './contact-message-dialog'

const CATEGORY_COLORS: Record<ContactCategory, string> = {
  general: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  support: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  feedback: 'bg-green-500/10 text-green-500 border-green-500/20',
  bug: 'bg-red-500/10 text-red-500 border-red-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

const STATUS_COLORS: Record<ContactStatus, string> = {
  unread: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  read: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  archived: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
}

function ContactMessagesTableContent() {
  const { addNotification } = useNotifications()
  const { pagination, searchQuery, setPagination } = usePaginationWithParams()
  const { data, isLoading, refetch, isFetching } = useContactMessages(searchQuery)
  const updateStatusMutation = useUpdateContactStatus()
  const deleteMutation = useDeleteContactMessage()
  const userTimezone = useTimezone()

  const [selectedMessage, setSelectedMessage] = useState<ContactMessageDto | null>(null)

  const pageCount = Math.ceil((data?.totalCount || 0) / pagination.pageSize)

  const handleStatusChange = useCallback(
    async (id: number, status: ContactStatus) => {
      try {
        await updateStatusMutation.mutateAsync({ id, status })
      } catch (error) {
        addNotification({
          message: 'Failed to update message status',
          type: 'error',
        })
      }
    },
    [updateStatusMutation, addNotification]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm('Are you sure you want to delete this message?')) return

      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        addNotification({
          message: 'Failed to delete message',
          type: 'error',
        })
      }
    },
    [deleteMutation, addNotification]
  )

  const columns: ColumnDef<ContactMessageDto>[] = useMemo(
    () => [
      {
        accessorKey: 'createdAt',
        size: 140,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => (
          <div className="text-sm whitespace-nowrap flex justify-center">
            {formatForUser(new Date(row.original.createdAt), userTimezone)}
          </div>
        ),
      },
      {
        accessorKey: 'email',
        size: 200,
        header: ({ column }) => <DataTableColumnHeader column={column} title="From" />,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <div className="text-sm font-medium truncate" title={row.original.email}>
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        size: 130,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge variant="outline" className={CATEGORY_COLORS[row.original.category]}>
              {row.original.category}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        size: 100,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge variant="outline" className={STATUS_COLORS[row.original.status]}>
              {row.original.status}
            </Badge>
          </div>
        ),
      },
      {
        id: 'actions',
        size: 170,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
        cell: ({ row }) => (
          <div className="flex gap-1 justify-center">
            <button
              title="View"
              className="h-8 w-8 p-0 rounded-md border border-border bg-background hover:bg-accent hover:border-accent text-foreground transition-all duration-200 flex items-center justify-center"
              onClick={() => {
                setSelectedMessage(row.original)
                if (row.original.status === 'unread') {
                  handleStatusChange(row.original.id, 'read')
                }
              }}
            >
              <FaEye className="text-sm" />
            </button>
            {row.original.status === 'unread' ? (
              <button
                title="Mark as Read"
                className="h-8 w-8 p-0 rounded-md border border-border bg-background hover:bg-green-500 hover:text-white hover:border-green-500 text-foreground transition-all duration-200 flex items-center justify-center"
                onClick={() => handleStatusChange(row.original.id, 'read')}
                disabled={updateStatusMutation.isPending}
              >
                <FaEnvelopeOpen className="text-sm" />
              </button>
            ) : (
              <button
                title="Mark as Unread"
                className="h-8 w-8 p-0 rounded-md border border-border bg-background hover:bg-yellow-500 hover:text-white hover:border-yellow-500 text-foreground transition-all duration-200 flex items-center justify-center"
                onClick={() => handleStatusChange(row.original.id, 'unread')}
                disabled={updateStatusMutation.isPending}
              >
                <FaEnvelope className="text-sm" />
              </button>
            )}
            <button
              title="Archive"
              className="h-8 w-8 p-0 rounded-md border border-border bg-background hover:bg-purple-500 hover:text-white hover:border-purple-500 text-foreground transition-all duration-200 flex items-center justify-center"
              onClick={() => handleStatusChange(row.original.id, 'archived')}
              disabled={updateStatusMutation.isPending || row.original.status === 'archived'}
            >
              <FaArchive className="text-sm" />
            </button>
            <button
              title="Delete"
              className="h-8 w-8 p-0 rounded-md border border-border bg-background hover:bg-red-500 hover:text-white hover:border-red-500 text-foreground transition-all duration-200 flex items-center justify-center"
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteMutation.isPending}
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        ),
      },
    ],
    [userTimezone, updateStatusMutation.isPending, deleteMutation.isPending, handleStatusChange, handleDelete]
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
          page: updated.pageIndex + 1,
        }
      })
    },
    [setPagination]
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-border bg-background hover:bg-accent text-foreground transition-colors disabled:opacity-50"
        >
          <FaSync className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <DataTable
        columns={columns}
        data={data?.content || []}
        onPaginationChange={onPaginationChange}
        totalCount={pageCount}
        pagination={pagination}
        loading={isLoading}
      />
      <ContactMessageDialog
        message={selectedMessage}
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      />
    </div>
  )
}

export function ContactMessagesTable() {
  return (
    <Suspense>
      <ContactMessagesTableContent />
    </Suspense>
  )
}
