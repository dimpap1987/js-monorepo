'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { DataTable, DataTableColumnHeader } from '@js-monorepo/components/table'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@js-monorepo/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@js-monorepo/components/ui/dropdown'
import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { formatPrice } from '@js-monorepo/currency'
import { usePaginationWithParams, useTimezone } from '@js-monorepo/next/hooks'
import { useDebounce } from '@js-monorepo/next/hooks/use-debounce'
import { useNotifications } from '@js-monorepo/notification'
import { apiDeactivateTrial, apiExtendTrial, PlanBadge } from '@js-monorepo/payments-ui'
import { Pageable, PaginationType } from '@js-monorepo/types/pagination'
import { Subscription, SubscriptionStatus } from '@js-monorepo/types/subscription'
import { formatForUser } from '@js-monorepo/utils/date'
import { DATE_CONFIG } from '@js-monorepo/utils/date/constants'
import { apiClient } from '@js-monorepo/utils/http'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import {
  CalendarPlus,
  ExternalLink,
  MoreHorizontal,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'
import { useLocale } from 'next-intl'
import { Dispatch, SetStateAction, Suspense, useCallback, useEffect, useMemo, useState } from 'react'

interface SubscriptionStats {
  activeCount: number
  trialingCount: number
  churnedThisMonth: number
  mrr: number
}

const fetchSubscriptions = async (searchQuery: string, filters: { status?: string; search?: string }) => {
  const params = new URLSearchParams(searchQuery)
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)

  const { data } = await apiClient.get<PaginationType<Subscription>>(`/admin/subscriptions?${params.toString()}`)
  return data
}

const fetchStats = async () => {
  const { data } = await apiClient.get<SubscriptionStats>('/admin/subscriptions/stats')
  return data
}

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    active: { variant: 'default', label: 'Active' },
    trialing: { variant: 'secondary', label: 'Trial' },
    canceled: { variant: 'destructive', label: 'Canceled' },
    past_due: { variant: 'outline', label: 'Past Due' },
    incomplete: { variant: 'outline', label: 'Incomplete' },
    unpaid: { variant: 'destructive', label: 'Unpaid' },
  }
  const config = variants[status] || { variant: 'outline' as const, label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'in 1 day'
  if (diffDays === -1) return '1 day ago'
  if (diffDays > 0 && diffDays < 30) return `in ${diffDays} days`
  if (diffDays < 0 && diffDays > -30) return `${Math.abs(diffDays)} days ago`
  if (diffDays >= 30) return `in ${Math.round(diffDays / 30)} months`
  return `${Math.round(Math.abs(diffDays) / 30)} months ago`
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: 'up' | 'down'
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SubscriptionsPageContent() {
  const { pagination, searchQuery, setPagination } = usePaginationWithParams()
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<string>('')
  const userTimezone = useTimezone()
  const currentLocale = useLocale()
  const debouncedSearch = useDebounce(searchInput, 300)
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  const [extendTrialDialog, setExtendTrialDialog] = useState<{ open: boolean; subscriptionId?: number }>({
    open: false,
  })
  const [deactivateTrialDialog, setDeactivateTrialDialog] = useState<{ open: boolean; subscriptionId?: number }>({
    open: false,
  })
  const [additionalDays, setAdditionalDays] = useState<number>(7)

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [debouncedSearch, setPagination])

  const { data: stats } = useQuery<SubscriptionStats>({
    queryKey: ['subscription-stats'],
    queryFn: fetchStats,
  })

  const { data, isLoading } = useQuery<PaginationType<Subscription>>({
    queryKey: ['subscriptions', searchQuery, status, debouncedSearch],
    queryFn: () =>
      fetchSubscriptions(searchQuery, { status: status || undefined, search: debouncedSearch || undefined }),
    placeholderData: (previousData) => previousData,
  })

  const pageCount = Math.ceil((data?.totalCount || 0) / pagination.pageSize)

  const handleStatusChange = (value: string) => {
    setStatus(value === 'all' ? '' : value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const openStripeCustomer = (stripeCustomerId: string) => {
    window.open(`https://dashboard.stripe.com/customers/${stripeCustomerId}`, '_blank')
  }

  const openStripeSubscription = (stripeSubscriptionId: string) => {
    window.open(`https://dashboard.stripe.com/subscriptions/${stripeSubscriptionId}`, '_blank')
  }

  const extendTrialMutation = useMutation({
    mutationFn: ({ subscriptionId, days }: { subscriptionId: number; days: number }) =>
      apiExtendTrial(subscriptionId, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] })
      addNotification({
        message: 'Trial Extended',
        description: `Trial extended by ${additionalDays} days successfully`,
        type: 'success',
      })
      setExtendTrialDialog({ open: false })
      setAdditionalDays(7)
    },
    onError: (error: any) => {
      addNotification({
        message: 'Failed to Extend Trial',
        description: error?.message || 'An error occurred while extending the trial',
        type: 'error',
      })
    },
  })

  const deactivateTrialMutation = useMutation({
    mutationFn: ({ subscriptionId }: { subscriptionId: number }) => apiDeactivateTrial(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] })
      addNotification({
        message: 'Trial Deactivated',
        description: 'Trial has been deactivated successfully',
        type: 'success',
      })
      setDeactivateTrialDialog({ open: false })
    },
    onError: (error: any) => {
      addNotification({
        message: 'Failed to Deactivate Trial',
        description: error?.message || 'An error occurred while deactivating the trial',
        type: 'error',
      })
    },
  })

  const onPaginationChange = useCallback<Dispatch<SetStateAction<{ pageSize: number; pageIndex: number }>>>(
    (newPaginationOrUpdater) => {
      setPagination((prevPagination: Pageable) => {
        const currentState = {
          pageSize: prevPagination.pageSize,
          pageIndex: prevPagination.page - 1,
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

  const columns: ColumnDef<Subscription>[] = useMemo(
    () => [
      {
        accessorKey: 'user',
        size: 200,
        header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium">{row.original.paymentCustomer.authUser.username}</p>
              <p className="text-sm text-muted-foreground">{row.original.paymentCustomer.authUser.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'plan',
        size: 120,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Plan" />,
        cell: ({ row }) => <PlanBadge plan={row.original.price.product.name} />,
      },
      {
        accessorKey: 'status',
        size: 100,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'amount',
        size: 120,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => {
          const sub = row.original
          if (sub.status === SubscriptionStatus.TRIALING) {
            return (
              <div className="flex gap-1">
                <p className="font-medium">0</p>
                <p className="text-sm text-muted-foreground">/{sub.price.interval}</p>
              </div>
            )
          }
          const formattedPrice = formatPrice(
            sub.price.unitAmount,
            currentLocale as 'en' | 'el',
            sub.price.currency.toUpperCase()
          )
          return (
            <div className="flex gap-1">
              <p className="font-medium">{formattedPrice}</p>
              <p className="text-sm text-muted-foreground">/{sub.price.interval}</p>
            </div>
          )
        },
      },
      {
        accessorKey: 'currentPeriodEnd',
        size: 140,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Period End" />,
        cell: ({ row }) => (
          <div>
            <p>
              {row.original.currentPeriodEnd
                ? formatForUser(row.original.currentPeriodEnd, userTimezone, DATE_CONFIG.FORMATS.DISPLAY)
                : '-'}
            </p>
            <p className="text-sm text-muted-foreground">
              {row.original.currentPeriodEnd ? formatRelativeDate(new Date(row.original.currentPeriodEnd)) : '-'}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'info',
        size: 160,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Info" />,
        cell: ({ row }) => {
          const sub = row.original
          return (
            <div>
              {sub.status === SubscriptionStatus.TRIALING && sub.trialEnd && (
                <div className="text-sm">
                  <span className="text-amber-600 dark:text-amber-400">Trial ends </span>
                  <span>{formatRelativeDate(new Date(sub.trialEnd))}</span>
                </div>
              )}
              {sub.cancelAt && (
                <div className="text-sm">
                  <span className="text-red-600 dark:text-red-400">Cancels </span>
                  <span>{formatRelativeDate(new Date(sub.cancelAt))}</span>
                </div>
              )}
              {sub.cancelReason && (
                <p className="text-xs text-muted-foreground capitalize">{sub.cancelReason.replace(/_/g, ' ')}</p>
              )}
              {!sub.stripeSubscriptionId && sub.status === SubscriptionStatus.TRIALING && (
                <Badge variant="outline" className="text-xs">
                  Local Trial
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        id: 'actions',
        size: 50,
        header: () => null,
        cell: ({ row }) => {
          const sub = row.original
          const isTrialing = sub.status === SubscriptionStatus.TRIALING
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-md">
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isTrialing && (
                  <>
                    <DropdownMenuItem
                      onSelect={() => {
                        setTimeout(() => {
                          setExtendTrialDialog({ open: true, subscriptionId: sub.id })
                        }, 100)
                      }}
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Extend Trial
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setTimeout(() => {
                          setDeactivateTrialDialog({ open: true, subscriptionId: sub.id })
                        }, 100)
                      }}
                      className="text-destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Deactivate Trial
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => openStripeCustomer(sub.paymentCustomer.stripeCustomerId)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Customer in Stripe
                </DropdownMenuItem>
                {sub.stripeSubscriptionId && (
                  <DropdownMenuItem onClick={() => openStripeSubscription(sub.stripeSubscriptionId as string)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Subscription in Stripe
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [userTimezone, currentLocale, setExtendTrialDialog, setDeactivateTrialDialog]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage and monitor all subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Subscriptions" value={stats?.activeCount ?? '-'} icon={Users} />
        <StatCard
          title="Monthly Revenue"
          value={stats?.mrr ? formatPrice(stats.mrr, currentLocale as 'en' | 'el', 'EUR') : '-'}
          icon={TrendingUp}
        />
        <StatCard title="Active Trials" value={stats?.trialingCount ?? '-'} icon={Zap} />
        <StatCard title="Churned (This Month)" value={stats?.churnedThisMonth ?? '-'} icon={TrendingDown} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.content || []}
        onPaginationChange={onPaginationChange}
        totalCount={pageCount}
        pagination={pagination}
        loading={isLoading}
      />

      {/* Extend Trial Dialog */}
      <Dialog open={extendTrialDialog.open} onOpenChange={(open) => setExtendTrialDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>Add additional days to the trial period</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="days" className="text-sm font-medium">
                Additional Days
              </label>
              <Input
                id="days"
                type="number"
                min="1"
                max="365"
                value={additionalDays}
                onChange={(e) => setAdditionalDays(parseInt(e.target.value) || 7)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setExtendTrialDialog({ open: false })}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                if (extendTrialDialog.subscriptionId) {
                  extendTrialMutation.mutate({
                    subscriptionId: extendTrialDialog.subscriptionId,
                    days: additionalDays,
                  })
                }
              }}
              disabled={extendTrialMutation.isPending}
              loading={extendTrialMutation.isPending}
            >
              Extend Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Trial Dialog */}
      <Dialog open={deactivateTrialDialog.open} onOpenChange={(open) => setDeactivateTrialDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Trial</DialogTitle>
            <DialogDescription>
              This will immediately cancel the trial. The user will lose access to premium features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeactivateTrialDialog({ open: false })}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deactivateTrialDialog.subscriptionId) {
                  deactivateTrialMutation.mutate({ subscriptionId: deactivateTrialDialog.subscriptionId })
                }
              }}
              disabled={deactivateTrialMutation.isPending}
              loading={deactivateTrialMutation.isPending}
            >
              Deactivate Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SubscriptionsPage() {
  return (
    <Suspense>
      <SubscriptionsPageContent />
    </Suspense>
  )
}
