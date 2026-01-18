'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@js-monorepo/components/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@js-monorepo/components/ui/dropdown'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@js-monorepo/components/ui/tooltip'
import { cn } from '@js-monorepo/ui/util'
import { Pageable, PaginationType } from '@js-monorepo/types/pagination'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Cloud,
  Download,
  Edit,
  ExternalLink,
  Link2Off,
  MoreHorizontal,
  Plus,
  Power,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react'
import { Fragment, useState } from 'react'
import { AdminProduct, SyncStatus } from '../../types'
import {
  ActiveStatusBadge,
  FeatureCountBadge,
  HierarchyBadge,
  PriceCountBadge,
  PriceStatusBadge,
  StripeSyncBadge,
} from './product-status-badge'
import { formatPrice } from '@js-monorepo/currency'
import { useLocale } from 'next-intl'

interface ProductsTableProps {
  data: PaginationType<AdminProduct> | undefined
  pagination: Pageable
  onPaginationChange: (pagination: Pageable) => void
  isLoading?: boolean
  onEdit?: (product: AdminProduct) => void
  onDelete?: (product: AdminProduct) => void
  onToggleActive?: (product: AdminProduct) => void
  onSync?: (product: AdminProduct) => void
  onAddPrice?: (product: AdminProduct) => void
  onEditPrice?: (productId: number, priceId: number) => void
  onDeletePrice?: (productId: number, priceId: number) => void
  onTogglePriceActive?: (productId: number, priceId: number, active: boolean) => void
  onSyncPrice?: (productId: number, priceId: number) => void
  // Reconciliation handlers
  onVerifySync?: (product: AdminProduct) => void
  onPushToStripe?: (product: AdminProduct) => void
  onPullFromStripe?: (product: AdminProduct) => void
  onUnlink?: (product: AdminProduct) => void
  verifiedSyncStatus?: Map<number, SyncStatus>
  verifyingProductIds?: Set<number>
  verifiedPriceSyncStatus?: Map<number, SyncStatus>
  verifyingPriceIds?: Set<number>
  syncingPriceIds?: Set<number>
}

function PricesSubRow({
  product,
  onEditPrice,
  onDeletePrice,
  onTogglePriceActive,
  onSyncPrice,
  verifiedPriceSyncStatus,
  verifyingPriceIds,
  syncingPriceIds,
}: {
  product: AdminProduct
  onEditPrice?: (productId: number, priceId: number) => void
  onDeletePrice?: (productId: number, priceId: number) => void
  onTogglePriceActive?: (productId: number, priceId: number, active: boolean) => void
  onSyncPrice?: (productId: number, priceId: number) => void
  verifiedPriceSyncStatus?: Map<number, SyncStatus>
  verifyingPriceIds?: Set<number>
  syncingPriceIds?: Set<number>
}) {
  const locale = useLocale() as 'en' | 'el'
  if (product.prices.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="bg-muted/30">
          <div className="px-8 py-4 text-sm text-muted-foreground">No prices configured for this product</div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow>
      <TableCell colSpan={8} className="p-0">
        <div className="px-12 py-4 bg-muted/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left pb-2 font-medium">Amount</th>
                <th className="text-left pb-2 font-medium">Interval</th>
                <th className="text-left pb-2 font-medium">Status</th>
                <th className="text-left pb-2 font-medium">Price Status</th>
                <th className="text-left pb-2 font-medium">Stripe</th>
                <th className="text-center pb-2 font-medium">Sync</th>
                <th className="text-right pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {product.prices.map((price) => {
                const priceVerifiedStatus = verifiedPriceSyncStatus?.get(price.id)
                const isPriceVerifying = verifyingPriceIds?.has(price.id)
                const isPriceSyncing = syncingPriceIds?.has(price.id)
                // Determine if price can be synced
                const isPriceLocal = price.stripeId.startsWith('local_price_')
                const isPriceOrphaned = priceVerifiedStatus === SyncStatus.ORPHANED
                const isPriceAlreadySynced = priceVerifiedStatus === SyncStatus.SYNCED
                // Price has a stripeId (not local) - could be synced or orphaned
                const hasStripeId = !isPriceLocal
                // Allow sync if:
                // 1. Price is local (stripeId starts with 'local_price_') - always allow
                // 2. Price is verified as orphaned - allow to recreate
                // 3. Price has a stripeId but is NOT verified as synced - could be orphaned, backend will check
                // Don't allow if price is verified as already synced and exists in Stripe
                // Backend will handle: checking if price exists in Stripe, creating if orphaned, validating product sync
                const canSyncPrice = isPriceLocal || isPriceOrphaned || (hasStripeId && !isPriceAlreadySynced)

                // Find the price that replaced this one (if legacy)
                const replacedByPrice = price.replacedByPriceId
                  ? product.prices.find((p) => p.id === price.replacedByPriceId)
                  : null

                return (
                  <tr
                    key={price.id}
                    className={cn(
                      'border-t border-border/50',
                      price.status === 'legacy' && 'bg-amber-50/30 dark:bg-amber-950/10'
                    )}
                  >
                    <td className="py-2 font-medium">
                      <div className="flex flex-col">
                        <span>{formatPrice(price.unitAmount, locale, price.currency.toUpperCase())}</span>
                        {replacedByPrice && (
                          <span className="text-xs text-muted-foreground">
                            Replaced by:{' '}
                            {formatPrice(replacedByPrice.unitAmount, locale, replacedByPrice.currency.toUpperCase())}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 capitalize">{price.interval}ly</td>
                    <td className="py-2">
                      <ActiveStatusBadge active={price.active} />
                    </td>
                    <td className="py-2">
                      <PriceStatusBadge
                        status={(price.status as 'active' | 'legacy' | 'deprecated' | 'archived') || 'active'}
                      />
                    </td>
                    <td className="py-2">
                      <StripeSyncBadge verifiedStatus={priceVerifiedStatus} isVerifying={isPriceVerifying} />
                    </td>
                    <td className="py-2 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSyncPrice?.(product.id, price.id)}
                        disabled={!canSyncPrice || isPriceSyncing}
                        className="h-7 px-2 text-xs"
                      >
                        {isPriceSyncing ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <Cloud className="w-3 h-3 mr-1" />
                            Sync
                          </>
                        )}
                      </Button>
                    </td>
                    <td className="py-2 text-right">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="p-1 rounded-md hover:bg-accent">
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditPrice?.(product.id, price.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Price
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onTogglePriceActive?.(product.id, price.id, !price.active)}>
                            <Power className="w-4 h-4 mr-2" />
                            {price.active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onSyncPrice?.(product.id, price.id)}
                            disabled={!canSyncPrice || isPriceSyncing}
                          >
                            {isPriceSyncing ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <Cloud className="w-4 h-4 mr-2" />
                                Sync to Stripe
                              </>
                            )}
                          </DropdownMenuItem>
                          {price.stripeId && !price.stripeId.startsWith('local_price_') && (
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(`https://dashboard.stripe.com/prices/${price.stripeId}`, '_blank')
                              }
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View in Stripe
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeletePrice?.(product.id, price.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Price
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </TableCell>
    </TableRow>
  )
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginationChange({ ...pagination, page: 1 })}
          disabled={!canGoPrevious}
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginationChange({ ...pagination, page: currentPage - 1 })}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginationChange({ ...pagination, page: currentPage + 1 })}
          disabled={!canGoNext}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginationChange({ ...pagination, page: pageCount })}
          disabled={!canGoNext}
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function ProductsTable({
  data,
  pagination,
  onPaginationChange,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
  onSync,
  onAddPrice,
  onEditPrice,
  onDeletePrice,
  onTogglePriceActive,
  onSyncPrice,
  onVerifySync,
  onPushToStripe,
  onPullFromStripe,
  onUnlink,
  verifiedSyncStatus,
  verifyingProductIds,
  verifiedPriceSyncStatus,
  verifyingPriceIds,
  syncingPriceIds,
}: ProductsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRow = (productId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const products = data?.content || []
  const totalCount = data?.totalCount || 0

  return (
    <div className="overflow-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="w-[100px]">Tier</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px]">Stripe</TableHead>
            <TableHead className="w-[100px]">Features</TableHead>
            <TableHead className="w-[100px]">Prices</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingSkeleton />
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const isExpanded = expandedRows.has(product.id)
              const features = product.metadata?.features ?? []
              const featureCount = features ? Object.keys(features).length : 0
              const verifiedStatus = verifiedSyncStatus?.get(product.id)
              const isVerifying = verifyingProductIds?.has(product.id)

              return (
                <Fragment key={product.id}>
                  <TableRow>
                    <TableCell>
                      <button onClick={() => toggleRow(product.id)} className="p-1 hover:bg-accent rounded">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <HierarchyBadge hierarchy={product.hierarchy} />
                    </TableCell>
                    <TableCell>
                      <ActiveStatusBadge active={product.active} />
                    </TableCell>
                    <TableCell>
                      <StripeSyncBadge verifiedStatus={verifiedStatus} isVerifying={isVerifying} />
                    </TableCell>
                    <TableCell>
                      {featureCount === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <FeatureCountBadge count={featureCount} />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <ul className="space-y-1">
                                {Object.entries(features).map(([key, value]) => (
                                  <li key={key} className="text-sm">
                                    <span className="font-medium">{key}:</span> {value}
                                  </li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell>
                      <PriceCountBadge count={product.prices.length} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="p-2 rounded-md hover:bg-accent">
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(product)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onAddPrice?.(product)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Price
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onToggleActive?.(product)}>
                            <Power className="w-4 h-4 mr-2" />
                            {product.active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* Reconciliation Actions */}
                          <DropdownMenuItem onClick={() => onVerifySync?.(product)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Verify Sync Status
                          </DropdownMenuItem>
                          {/* Show Push to Stripe for local-only or orphaned products */}
                          {(verifiedStatus === SyncStatus.LOCAL_ONLY || verifiedStatus === SyncStatus.ORPHANED) && (
                            <DropdownMenuItem onClick={() => onPushToStripe?.(product)}>
                              <Upload className="w-4 h-4 mr-2" />
                              Push to Stripe
                            </DropdownMenuItem>
                          )}
                          {/* Show Pull from Stripe for synced products with drift */}
                          {verifiedStatus === SyncStatus.DRIFT && (
                            <DropdownMenuItem onClick={() => onPullFromStripe?.(product)}>
                              <Download className="w-4 h-4 mr-2" />
                              Pull from Stripe
                            </DropdownMenuItem>
                          )}
                          {/* Show Unlink for orphaned products */}
                          {verifiedStatus === SyncStatus.ORPHANED && (
                            <DropdownMenuItem onClick={() => onUnlink?.(product)}>
                              <Link2Off className="w-4 h-4 mr-2" />
                              Unlink from Stripe
                            </DropdownMenuItem>
                          )}
                          {product.stripeId && !product.stripeId.startsWith('local_') && (
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(`https://dashboard.stripe.com/products/${product.stripeId}`, '_blank')
                              }
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View in Stripe
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete?.(product)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <PricesSubRow
                      product={product}
                      onEditPrice={onEditPrice}
                      onDeletePrice={onDeletePrice}
                      onTogglePriceActive={onTogglePriceActive}
                      onSyncPrice={onSyncPrice}
                      verifiedPriceSyncStatus={verifiedPriceSyncStatus}
                      verifyingPriceIds={verifyingPriceIds}
                      syncingPriceIds={syncingPriceIds}
                    />
                  )}
                </Fragment>
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
