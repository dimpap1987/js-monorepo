'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@js-monorepo/components/avatar'
import { Badge } from '@js-monorepo/components/badge'
import { Card, CardContent } from '@js-monorepo/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@js-monorepo/components/dropdown'
import { Input } from '@js-monorepo/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@js-monorepo/components/table'
import { useDebounce } from '@js-monorepo/next/hooks/use-debounce'
import { PlanBadge } from '@js-monorepo/payments-ui'
import { apiClient } from '@js-monorepo/utils/http'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, MoreHorizontal, Search, TrendingDown, TrendingUp, Users, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SubscriptionPagination } from './subscription-pagination'

interface Subscription {
  id: number
  stripeSubscriptionId: string | null
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  trialStart: string | null
  trialEnd: string | null
  cancelAt: string | null
  canceledAt: string | null
  cancelReason: string | null
  createdAt: string
  price: {
    id: number
    unitAmount: number
    currency: string
    interval: string
    product: {
      id: number
      name: string
    }
  }
  paymentCustomer: {
    stripeCustomerId: string
    authUser: {
      id: number
      username: string
      email: string
      userProfiles: Array<{ profileImage: string }>
    }
  }
}

interface SubscriptionsResponse {
  subscriptions: Subscription[]
  totalCount: number
}

interface SubscriptionStats {
  activeCount: number
  trialingCount: number
  churnedThisMonth: number
  mrr: number
}

const fetchSubscriptions = async (
  page: number,
  pageSize: number,
  filters: { status?: string; search?: string; plan?: string }
) => {
  const params = new URLSearchParams()
  params.set('page', page.toString())
  params.set('pageSize', pageSize.toString())
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)
  if (filters.plan) params.set('plan', filters.plan)

  const { data } = await apiClient.get<SubscriptionsResponse>(`/admin/subscriptions?${params.toString()}`)
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

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100)
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

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<string>('')
  const pageSize = 10

  const debouncedSearch = useDebounce(searchInput, 300)

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data: stats } = useQuery<SubscriptionStats>({
    queryKey: ['subscription-stats'],
    queryFn: fetchStats,
  })

  const { data, isLoading, error } = useQuery<SubscriptionsResponse>({
    queryKey: ['subscriptions', page, pageSize, status, debouncedSearch],
    queryFn: () =>
      fetchSubscriptions(page, pageSize, { status: status || undefined, search: debouncedSearch || undefined }),
  })

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize)

  const handleStatusChange = (value: string) => {
    setStatus(value === 'all' ? '' : value)
    setPage(1)
  }

  const openStripeCustomer = (stripeCustomerId: string) => {
    window.open(`https://dashboard.stripe.com/customers/${stripeCustomerId}`, '_blank')
  }

  const openStripeSubscription = (stripeSubscriptionId: string) => {
    window.open(`https://dashboard.stripe.com/subscriptions/${stripeSubscriptionId}`, '_blank')
  }

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
          value={stats?.mrr ? formatCurrency(stats.mrr, 'eur') : '-'}
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">Error loading subscriptions</div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead>Info</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                data?.subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{sub.paymentCustomer.authUser.username}</p>
                          <p className="text-sm text-muted-foreground">{sub.paymentCustomer.authUser.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={sub.price.product.name} />
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(sub.price.unitAmount, sub.price.currency)}</p>
                        <p className="text-sm text-muted-foreground">/{sub.price.interval}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatRelativeDate(new Date(sub.currentPeriodEnd))}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sub.status === 'trialing' && sub.trialEnd && (
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
                        <p className="text-xs text-muted-foreground capitalize">
                          {sub.cancelReason.replace(/_/g, ' ')}
                        </p>
                      )}
                      {!sub.stripeSubscriptionId && sub.status === 'trialing' && (
                        <Badge variant="outline" className="text-xs">
                          Local Trial
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 rounded-md">
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openStripeCustomer(sub.paymentCustomer.stripeCustomerId)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Customer in Stripe
                          </DropdownMenuItem>
                          {sub.stripeSubscriptionId && (
                            <DropdownMenuItem
                              onClick={() => openStripeSubscription(sub.stripeSubscriptionId as string)}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Subscription in Stripe
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && <SubscriptionPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  )
}
