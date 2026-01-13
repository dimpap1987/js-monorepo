'use client'

import { DpButton } from '@js-monorepo/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@js-monorepo/components/ui/dropdown'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@js-monorepo/components/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@js-monorepo/components/ui/tooltip'
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
import { formatPriceAmount, isProductSynced } from '../../utils/admin-api'
import {
  ActiveStatusBadge,
  FeatureCountBadge,
  HierarchyBadge,
  PriceCountBadge,
  StripeSyncBadge,
} from './product-status-badge'

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
}

function PricesSubRow({
  product,
  onEditPrice,
  onDeletePrice,
  onTogglePriceActive,
  onSyncPrice,
}: {
  product: AdminProduct
  onEditPrice?: (productId: number, priceId: number) => void
  onDeletePrice?: (productId: number, priceId: number) => void
  onTogglePriceActive?: (productId: number, priceId: number, active: boolean) => void
  onSyncPrice?: (productId: number, priceId: number) => void
}) {
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
                <th className="text-left pb-2 font-medium">Stripe</th>
                <th className="text-right pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {product.prices.map((price) => (
                <tr key={price.id} className="border-t border-border/50">
                  <td className="py-2 font-medium">{formatPriceAmount(price.unitAmount, price.currency)}</td>
                  <td className="py-2 capitalize">{price.interval}ly</td>
                  <td className="py-2">
                    <ActiveStatusBadge active={price.active} />
                  </td>
                  <td className="py-2">
                    <StripeSyncBadge stripeId={price.stripeId} />
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
                        {price.stripeId.startsWith('local_price_') && (
                          <DropdownMenuItem onClick={() => onSyncPrice?.(product.id, price.id)}>
                            <Cloud className="w-4 h-4 mr-2" />
                            Sync to Stripe
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
              ))}
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
              const isSynced = isProductSynced(product)
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
                      <StripeSyncBadge
                        stripeId={product.stripeId}
                        verifiedStatus={verifiedStatus}
                        isVerifying={isVerifying}
                      />
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
                                {Object.entries(features!).map(([key, value]) => (
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
                          {(!isSynced ||
                            verifiedStatus === SyncStatus.LOCAL_ONLY ||
                            verifiedStatus === SyncStatus.ORPHANED) && (
                            <DropdownMenuItem onClick={() => onPushToStripe?.(product)}>
                              <Upload className="w-4 h-4 mr-2" />
                              Push to Stripe
                            </DropdownMenuItem>
                          )}
                          {/* Show Pull from Stripe for synced products with drift */}
                          {isSynced && verifiedStatus === SyncStatus.DRIFT && (
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
                          {/* Legacy sync button for backward compatibility */}
                          {!isSynced && !verifiedStatus && (
                            <DropdownMenuItem onClick={() => onSync?.(product)}>
                              <Cloud className="w-4 h-4 mr-2" />
                              Sync to Stripe
                            </DropdownMenuItem>
                          )}
                          {isSynced && (
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
