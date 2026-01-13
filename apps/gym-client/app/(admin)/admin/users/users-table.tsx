'use client'

import { DpButton } from '@js-monorepo/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@js-monorepo/components/table'
import { Avatar, AvatarFallback, AvatarImage } from '@js-monorepo/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@js-monorepo/components/ui/dropdown'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { usePaginationWithParams, useTimezone } from '@js-monorepo/next/hooks'
import { useNotifications } from '@js-monorepo/notification'
import { UpdateUserSchemaType } from '@js-monorepo/schemas'
import { AuthUserFullDto } from '@js-monorepo/types/auth'
import { Pageable, PaginationType } from '@js-monorepo/types/pagination'
import { formatForUser } from '@js-monorepo/utils/date'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  MoreHorizontal,
  Trash2,
  UserCog,
} from 'lucide-react'
import { Suspense, useCallback, useState } from 'react'
import { ConfirmDialog } from './components/confirm-dialog'
import { useDeleteUser, useImpersonateUser, useUpdateUser, useUsers } from './queries'
import { UserEditDialog } from './user-edit-dialog'

interface UsersTableProps {
  data: PaginationType<AuthUserFullDto> | undefined
  pagination: Pageable
  onPaginationChange: (pagination: Pageable) => void
  isLoading?: boolean
  onEdit?: (user: AuthUserFullDto) => void
  onDelete?: (user: AuthUserFullDto) => void
  onImpersonate?: (user: AuthUserFullDto) => void
}

function TablePagination({
  pagination,
  totalCount,
  onPaginationChange,
}: {
  pagination: Pageable
  totalCount: number
  onPaginationChange: (pagination: Pageable) => void
}) {
  const pageCount = Math.ceil(totalCount / pagination.pageSize)
  const currentPage = pagination.page
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < pageCount

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {pageCount || 1}
      </div>
      <div className="flex items-center gap-2">
        <DpButton
          variant="outline"
          size="small"
          onClick={() => onPaginationChange({ ...pagination, page: 1 })}
          disabled={!canGoPrevious}
        >
          <ChevronsLeft className="w-4 h-4" />
        </DpButton>
        <DpButton
          variant="outline"
          size="small"
          onClick={() => onPaginationChange({ ...pagination, page: currentPage - 1 })}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="w-4 h-4" />
        </DpButton>
        <DpButton
          variant="outline"
          size="small"
          onClick={() => onPaginationChange({ ...pagination, page: currentPage + 1 })}
          disabled={!canGoNext}
        >
          <ChevronRight className="w-4 h-4" />
        </DpButton>
        <DpButton
          variant="outline"
          size="small"
          onClick={() => onPaginationChange({ ...pagination, page: pageCount })}
          disabled={!canGoNext}
        >
          <ChevronsRight className="w-4 h-4" />
        </DpButton>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-10 w-10 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-10" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

function UsersTable({
  data,
  pagination,
  onPaginationChange,
  isLoading,
  onEdit,
  onDelete,
  onImpersonate,
}: UsersTableProps) {
  const userTimezone = useTimezone()
  const users = data?.content || []
  const totalCount = data?.totalCount || 0

  return (
    <div className="overflow-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-[80px]"></TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingSkeleton />
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    {user.userProfiles?.[0]?.profileImage && (
                      <AvatarImage src={user.userProfiles?.[0]?.profileImage} alt={`${user.username} picture`} />
                    )}
                    <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || 'A'}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.userRole?.map((r) => r.role.name).join(', ')}</TableCell>
                <TableCell>{formatForUser(new Date(user.createdAt), userTimezone)}</TableCell>
                <TableCell>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="p-2 rounded-md hover:bg-accent">
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(user)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onImpersonate?.(user)}>
                        <UserCog className="w-4 h-4 mr-2" />
                        Impersonate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(user)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isLoading && totalCount > 0 && (
        <TablePagination pagination={pagination} totalCount={totalCount} onPaginationChange={onPaginationChange} />
      )}
    </div>
  )
}

function DashboardUsersTableContent() {
  const { addNotification } = useNotifications()
  const { pagination, searchQuery, setPagination } = usePaginationWithParams()
  const { data, isLoading, refetch } = useUsers(searchQuery)
  const updateUser = useUpdateUser()
  const impersonateUser = useImpersonateUser()
  const deleteUserMutation = useDeleteUser()

  const [editUser, setEditUser] = useState<AuthUserFullDto | null>(null)
  const [deleteUser, setDeleteUser] = useState<AuthUserFullDto | null>(null)

  const handleUpdateUser = async (userData: UpdateUserSchemaType) => {
    if (!editUser) return
    try {
      await updateUser.mutateAsync({ userId: editUser.id, data: userData })
      addNotification({ message: 'User updated successfully', type: 'success' })
      setEditUser(null)
      refetch()
    } catch (err: any) {
      addNotification({
        message: err?.errors?.map((error: { message: string }) => error.message).join(', ') || 'Failed to update user',
        type: 'error',
      })
    }
  }

  const handleImpersonate = async (user: AuthUserFullDto) => {
    try {
      const result = await impersonateUser.mutateAsync(user.id)
      if (result.success) {
        addNotification({ message: `Now logged in as ${user.username}`, type: 'success' })
        window.location.replace('/')
      } else {
        addNotification({ message: result.message || 'Failed to impersonate user', type: 'error' })
      }
    } catch {
      addNotification({ message: 'Failed to impersonate user', type: 'error' })
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteUser) return
    try {
      await deleteUserMutation.mutateAsync(deleteUser.id)
      addNotification({ message: 'User deleted successfully', type: 'success' })
      setDeleteUser(null)
      refetch()
    } catch (err: any) {
      addNotification({
        message: 'Failed to delete user',
        type: 'error',
      })
    }
  }

  const handlePaginationChange = useCallback(
    (newPagination: Pageable) => {
      setPagination(newPagination)
    },
    [setPagination]
  )

  return (
    <>
      <UsersTable
        data={data}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={isLoading}
        onEdit={setEditUser}
        onDelete={setDeleteUser}
        onImpersonate={handleImpersonate}
      />
      <UserEditDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        onSave={handleUpdateUser}
        isSaving={updateUser.isPending}
      />
      <ConfirmDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteUser?.username}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteUser}
        isLoading={deleteUserMutation.isPending}
        variant="destructive"
      />
    </>
  )
}

function DashboardUsersTable() {
  return (
    <Suspense>
      <DashboardUsersTableContent />
    </Suspense>
  )
}

export { DashboardUsersTable }
