'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@js-monorepo/components/table'
import { PlanBadge } from '@js-monorepo/payments-ui'
import { apiClient } from '@js-monorepo/utils/http'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { SubscriptionPagination } from './subscription-pagination'
import { Badge } from '@js-monorepo/components/badge'
import { BackArrowWithLabel } from '@js-monorepo/back-arrow'

interface Subscription {
  id: string
  stripeSubscriptionId: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAt: string | null
  canceledAt: string | null
  cancelReason: string | null
  createdAt: string
  price: {
    id: string
    unitAmount: number
    currency: string
    interval: string
    product: {
      id: string
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

const fetchSubscriptions = async (page: number, pageSize: number) => {
  const { data } = await apiClient.get<SubscriptionsResponse>(`/admin/subscriptions?page=${page}&pageSize=${pageSize}`)
  return data
}

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, error } = useQuery<SubscriptionsResponse>({
    queryKey: ['subscriptions', page, pageSize],
    queryFn: () => fetchSubscriptions(page, pageSize),
  })

  if (isLoading) return <div>Loading subscriptions...</div>
  if (error) return <div>Error loading subscriptions: {error.message}</div>

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize)

  return (
    <>
      <BackArrowWithLabel arrowClassName="sm:hidden">
        <h2 className="text-center sm:text-left">Subscriptions</h2>
      </BackArrowWithLabel>

      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader className="bg-secondary text-secondary-foreground">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Period End</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.subscriptions.map((sub) => (
              <TableRow key={sub.id} className="border-b border-border hover:bg-muted">
                <TableCell className="font-medium text-foreground">{sub.paymentCustomer.authUser.username}</TableCell>
                <TableCell className="text-foreground">{sub.paymentCustomer.authUser.email}</TableCell>
                <TableCell className="text-foreground">
                  <PlanBadge plan={sub.price.product.name} />
                </TableCell>
                <TableCell className="text-foreground">
                  {sub.price.unitAmount / 100} {sub.price.currency.toUpperCase()} ({sub.price.interval})
                </TableCell>
                <TableCell className="text-foreground">
                  <Badge variant="accent">{sub.status} </Badge>
                </TableCell>
                <TableCell className="text-foreground">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</TableCell>
                <TableCell className="text-foreground">{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && <SubscriptionPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </>
  )
}
