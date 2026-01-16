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
import { AuthUserFullDto, UserStatus } from '@js-monorepo/types/auth'
import { Pageable, PaginationType } from '@js-monorepo/types/pagination'
import { formatForUser } from '@js-monorepo/utils/date'
import {
  Ban,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  MoreHorizontal,
  Power,
  PowerOff,
  Trash2,
  UserCheck,
  UserCog,
  XCircle,
} from 'lucide-react'
import { Suspense, useCallback, useState } from 'react'
import { apiAssignTrial } from '@js-monorepo/payments-ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AssignTrialDialog } from './components/assign-trial-dialog'
import { ConfirmDialog } from './components/confirm-dialog'
import {
  useBanUser,
  useDeactivateUser,
  useDeleteUser,
  useImpersonateUser,
  useUnbanUser,
  useUpdateUser,
  useUsers,
} from './queries'
import { UserEditDialog } from './user-edit-dialog'

interface UsersTableProps {
  data: PaginationType<AuthUserFullDto> | undefined
  pagination: Pageable
  onPaginationChange: (pagination: Pageable) => void
  isLoading?: boolean
  onEdit?: (user: AuthUserFullDto) => void
  onDelete?: (user: AuthUserFullDto) => void
  onImpersonate?: (user: AuthUserFullDto) => void
  onAssignTrial?: (user: AuthUserFullDto) => void
  onBan?: (user: AuthUserFullDto) => void
  onUnban?: (user: AuthUserFullDto) => void
  onDeactivate?: (user: AuthUserFullDto) => void
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
  onAssignTrial,
  onBan,
  onUnban,
  onDeactivate,
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
            <TableHead>Status</TableHead>
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
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const status = user.status || UserStatus.ACTIVE
              const isBanned = status === UserStatus.BANNED
              const isDeactivated = status === UserStatus.DEACTIVATED
              const isActive = status === UserStatus.ACTIVE
              const isInactive = isBanned || isDeactivated

              return (
                <TableRow key={user.id} className={isInactive ? 'opacity-60 bg-muted/50' : ''}>
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
                  <TableCell>
                    {isActive ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </div>
                    ) : isBanned ? (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Banned</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <PowerOff className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Deactivated</span>
                      </div>
                    )}
                  </TableCell>
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
                        <DropdownMenuItem
                          onSelect={() => {
                            setTimeout(() => {
                              onAssignTrial?.(user)
                            }, 100)
                          }}
                        >
                          <CalendarPlus className="w-4 h-4 mr-2" />
                          Assign Trial
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {status === UserStatus.ACTIVE && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onBan?.(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDeactivate?.(user)}>
                              <PowerOff className="w-4 h-4 mr-2" />
                              Deactivate User
                            </DropdownMenuItem>
                          </>
                        )}
                        {status === UserStatus.BANNED && (
                          <DropdownMenuItem onClick={() => onUnban?.(user)}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Unban User
                          </DropdownMenuItem>
                        )}
                        {status === UserStatus.DEACTIVATED && (
                          <DropdownMenuItem onClick={() => onUnban?.(user)}>
                            <Power className="w-4 h-4 mr-2" />
                            Reactivate User
                          </DropdownMenuItem>
                        )}
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
              )
            })
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
  const banUserMutation = useBanUser()
  const unbanUserMutation = useUnbanUser()
  const deactivateUserMutation = useDeactivateUser()

  const [editUser, setEditUser] = useState<AuthUserFullDto | null>(null)
  const [deleteUser, setDeleteUser] = useState<AuthUserFullDto | null>(null)
  const [assignTrialUser, setAssignTrialUser] = useState<AuthUserFullDto | null>(null)
  const [banUser, setBanUser] = useState<AuthUserFullDto | null>(null)
  const [unbanUser, setUnbanUser] = useState<AuthUserFullDto | null>(null)
  const [deactivateUser, setDeactivateUser] = useState<AuthUserFullDto | null>(null)
  const queryClient = useQueryClient()

  const assignTrialMutation = useMutation({
    mutationFn: ({
      userId,
      priceId,
      trialDurationDays,
    }: {
      userId: number
      priceId: number
      trialDurationDays: number
    }) => apiAssignTrial(userId, priceId, trialDurationDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] })
      addNotification({
        message: 'Trial Assigned',
        description: `Trial has been assigned successfully`,
        type: 'success',
      })
      setAssignTrialUser(null)
      refetch()
    },
    onError: (error: any) => {
      addNotification({
        message: 'Failed to Assign Trial',
        description: error?.message || 'An error occurred while assigning the trial',
        type: 'error',
      })
    },
  })

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

  const handleBanUser = async () => {
    if (!banUser) return
    try {
      await banUserMutation.mutateAsync(banUser.id)
      addNotification({ message: `User "${banUser.username}" has been banned`, type: 'success' })
      setBanUser(null)
      refetch()
    } catch (err: any) {
      addNotification({
        message: 'Failed to ban user',
        type: 'error',
      })
    }
  }

  const handleUnbanUser = async () => {
    if (!unbanUser) return
    try {
      await unbanUserMutation.mutateAsync(unbanUser.id)
      addNotification({ message: `User "${unbanUser.username}" has been unbanned`, type: 'success' })
      setUnbanUser(null)
      refetch()
    } catch (err: any) {
      addNotification({
        message: 'Failed to unban user',
        type: 'error',
      })
    }
  }

  const handleDeactivateUser = async () => {
    if (!deactivateUser) return
    try {
      await deactivateUserMutation.mutateAsync(deactivateUser.id)
      addNotification({ message: `User "${deactivateUser.username}" has been deactivated`, type: 'success' })
      setDeactivateUser(null)
      refetch()
    } catch (err: any) {
      addNotification({
        message: 'Failed to deactivate user',
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
        onAssignTrial={setAssignTrialUser}
        onBan={setBanUser}
        onUnban={setUnbanUser}
        onDeactivate={setDeactivateUser}
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
      <AssignTrialDialog
        user={assignTrialUser}
        open={!!assignTrialUser}
        onOpenChange={(open) => !open && setAssignTrialUser(null)}
        onAssign={async (userId, priceId, trialDurationDays) => {
          await assignTrialMutation.mutateAsync({ userId, priceId, trialDurationDays })
        }}
        isLoading={assignTrialMutation.isPending}
      />
      <ConfirmDialog
        open={!!banUser}
        onOpenChange={(open) => !open && setBanUser(null)}
        title="Ban User"
        description={`Are you sure you want to ban "${banUser?.username}"? They will not be able to log in until unbanned.`}
        confirmLabel="Ban"
        onConfirm={handleBanUser}
        isLoading={banUserMutation.isPending}
        variant="destructive"
      />
      <ConfirmDialog
        open={!!unbanUser}
        onOpenChange={(open) => !open && setUnbanUser(null)}
        title={unbanUser?.status === UserStatus.DEACTIVATED ? 'Reactivate User' : 'Unban User'}
        description={
          unbanUser?.status === UserStatus.DEACTIVATED
            ? `Are you sure you want to reactivate "${unbanUser?.username}"? They will be able to log in again.`
            : `Are you sure you want to unban "${unbanUser?.username}"? They will be able to log in again.`
        }
        confirmLabel={unbanUser?.status === UserStatus.DEACTIVATED ? 'Reactivate' : 'Unban'}
        onConfirm={handleUnbanUser}
        isLoading={unbanUserMutation.isPending}
      />
      <ConfirmDialog
        open={!!deactivateUser}
        onOpenChange={(open) => !open && setDeactivateUser(null)}
        title="Deactivate User"
        description={`Are you sure you want to deactivate "${deactivateUser?.username}"? They will not be able to log in until reactivated.`}
        confirmLabel="Deactivate"
        onConfirm={handleDeactivateUser}
        isLoading={deactivateUserMutation.isPending}
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
