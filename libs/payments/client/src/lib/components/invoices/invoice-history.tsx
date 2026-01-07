'use client'

import { DpButton } from '@js-monorepo/button'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { ChevronDown, Download, ExternalLink, FileText, Receipt } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Invoice } from '../../types'
import { apiGetInvoices } from '../../utils/api'
import { InvoiceStatusBadge } from './invoice-status-badge'

const PAGE_SIZE = 5

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const handleDownload = () => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleViewOnline = () => {
    if (invoice.hostedInvoiceUrl) {
      window.open(invoice.hostedInvoiceUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background-secondary">
          <Receipt className="h-5 w-5 text-foreground-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground truncate">
              {invoice.number || `INV-${invoice.id.slice(-8).toUpperCase()}`}
            </span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-foreground-neutral">{formatDate(invoice.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="font-semibold text-foreground">{formatAmount(invoice.amount, invoice.currency)}</span>

        <div className="flex items-center gap-1">
          {invoice.hostedInvoiceUrl && (
            <DpButton
              variant="ghost"
              size="small"
              onClick={handleViewOnline}
              className="text-foreground-muted hover:text-foreground"
              title="View invoice online"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">View</span>
            </DpButton>
          )}
          {invoice.pdfUrl && (
            <DpButton
              variant="ghost"
              size="small"
              onClick={handleDownload}
              className="text-foreground-muted hover:text-foreground"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </DpButton>
          )}
        </div>
      </div>
    </div>
  )
}

function InvoiceSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
          <div className="flex items-center gap-4">
            <Skeleton className="hidden sm:block h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-secondary">
        <FileText className="h-8 w-8 text-foreground-muted" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No invoices yet</h3>
      <p className="text-foreground-neutral">Invoices will appear here after your first payment.</p>
    </div>
  )
}

export function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initial load
  const loadInitial = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiGetInvoices(PAGE_SIZE)
      if (response.ok && response.data) {
        setInvoices(response.data.invoices)
        setHasMore(response.data.hasMore)
      } else {
        setError('Failed to load invoices')
      }
    } catch {
      setError('Failed to load invoices')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load more invoices
  const loadMore = useCallback(async () => {
    if (invoices.length === 0 || isLoadingMore) return

    const lastInvoice = invoices[invoices.length - 1]
    try {
      setIsLoadingMore(true)
      const response = await apiGetInvoices(PAGE_SIZE, lastInvoice.id)
      if (response.ok && response.data) {
        const { invoices: newInvoices, hasMore: more } = response.data
        setInvoices((prev) => [...prev, ...newInvoices])
        setHasMore(more)
      }
    } catch (er: unknown) {
      console.error(er)
    } finally {
      setIsLoadingMore(false)
    }
  }, [invoices, isLoadingMore])

  // Load on mount
  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  if (isLoading) {
    return <InvoiceSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-status-error">{error}. Please try again later.</p>
      </div>
    )
  }

  if (invoices.length === 0) {
    return <EmptyState />
  }

  return (
    <div>
      <div className="divide-y divide-border">
        {invoices.map((invoice) => (
          <InvoiceRow key={invoice.id} invoice={invoice} />
        ))}
      </div>
      {hasMore && (
        <div className="pt-4 flex justify-center">
          <DpButton variant="outline" size="small" onClick={loadMore} loading={isLoadingMore}>
            <ChevronDown className="h-4 w-4 mr-2" />
            Load More
          </DpButton>
        </div>
      )}
    </div>
  )
}
