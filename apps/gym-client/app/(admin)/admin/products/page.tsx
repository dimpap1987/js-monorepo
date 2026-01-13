'use client'

import { DpButton } from '@js-monorepo/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { useDebounce } from '@js-monorepo/next/hooks/use-debounce'
import { usePaginationWithParams } from '@js-monorepo/next/hooks'
import { useNotifications } from '@js-monorepo/notification'
import {
  AdminProduct,
  ProductsTable,
  ReconciliationPanel,
  SyncStatus,
  useAdminProducts,
  useAdminProductStats,
  useDeletePrice,
  useDeleteProduct,
  usePullFromStripe,
  usePushToStripe,
  useSyncPriceToStripe,
  useSyncProductToStripe,
  useTogglePriceActive,
  useToggleProductActive,
  useUnlinkProduct,
  useVerifyProductSync,
} from '@js-monorepo/payments-ui'
import { Box, Cloud, CloudOff, Package, Plus, Search } from 'lucide-react'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { ConfirmDialog } from './components/confirm-dialog'
import { PriceDialog } from './components/price-dialog'
import { ProductDialog } from './components/product-dialog'

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function ProductsPageContent() {
  const { pagination, setPagination } = usePaginationWithParams()
  const { addNotification } = useNotifications()

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const debouncedSearch = useDebounce(searchInput, 300)

  // Dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePriceDialogOpen, setDeletePriceDialogOpen] = useState(false)

  // Selected items
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null)
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<number | null>(null)
  const [selectedPriceId, setSelectedPriceId] = useState<number | null>(null)

  // Reconciliation state
  const [verifiedSyncStatus, setVerifiedSyncStatus] = useState<Map<number, SyncStatus>>(new Map())
  const [verifyingProductIds, setVerifyingProductIds] = useState<Set<number>>(new Set())

  // Build filters
  const filters = {
    ...(activeFilter !== 'all' && { active: activeFilter === 'active' }),
    ...(debouncedSearch && { search: debouncedSearch }),
  }

  // Queries
  const { data: stats, refetch: refetchStats } = useAdminProductStats()
  const { data, isLoading, refetch: refetchProducts } = useAdminProducts(pagination.page, pagination.pageSize, filters)

  // Mutations
  const deleteProduct = useDeleteProduct()
  const toggleProductActive = useToggleProductActive()
  const syncProductToStripe = useSyncProductToStripe()
  const deletePrice = useDeletePrice()
  const togglePriceActive = useTogglePriceActive()
  const syncPriceToStripe = useSyncPriceToStripe()

  // Reconciliation mutations
  const verifySync = useVerifyProductSync()
  const pushToStripe = usePushToStripe()
  const pullFromStripe = usePullFromStripe()
  const unlinkProduct = useUnlinkProduct()

  // Reset page on filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [debouncedSearch, activeFilter, setPagination])

  const onReconciliationComplete = () => {
    addNotification({ message: 'Reconciliation complete', type: 'success' })
    refetchProducts()
    refetchStats()
  }

  // Handlers
  const handleEdit = (product: AdminProduct) => {
    setSelectedProduct(product)
    setProductDialogOpen(true)
  }

  const handleDelete = (product: AdminProduct) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return
    try {
      await deleteProduct.mutateAsync(selectedProduct.id)
      addNotification({ message: 'Product deleted successfully', type: 'success' })
      setDeleteDialogOpen(false)
      setSelectedProduct(null)
    } catch {
      addNotification({ message: 'Failed to delete product. It may have subscriptions.', type: 'error' })
    }
  }

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      await toggleProductActive.mutateAsync({ id: product.id, active: !product.active })
      addNotification({
        message: `Product ${product.active ? 'deactivated' : 'activated'} successfully`,
        type: 'success',
      })
    } catch {
      addNotification({ message: 'Failed to update product status', type: 'error' })
    }
  }

  const handleSync = async (product: AdminProduct) => {
    try {
      await syncProductToStripe.mutateAsync(product.id)
      addNotification({ message: 'Product synced to Stripe successfully', type: 'success' })
    } catch {
      addNotification({ message: 'Failed to sync product to Stripe', type: 'error' })
    }
  }

  const handleAddPrice = (product: AdminProduct) => {
    setSelectedProductForPrice(product.id)
    setSelectedPriceId(null)
    setPriceDialogOpen(true)
  }

  const handleEditPrice = (productId: number, priceId: number) => {
    setSelectedProductForPrice(productId)
    setSelectedPriceId(priceId)
    setPriceDialogOpen(true)
  }

  const handleDeletePrice = (productId: number, priceId: number) => {
    setSelectedProductForPrice(productId)
    setSelectedPriceId(priceId)
    setDeletePriceDialogOpen(true)
  }

  const handleConfirmDeletePrice = async () => {
    if (!selectedPriceId) return
    try {
      await deletePrice.mutateAsync(selectedPriceId)
      addNotification({ message: 'Price deleted successfully', type: 'success' })
      setDeletePriceDialogOpen(false)
      setSelectedPriceId(null)
    } catch {
      addNotification({ message: 'Failed to delete price. It may have subscriptions.', type: 'error' })
    }
  }

  const handleTogglePriceActive = async (productId: number, priceId: number, active: boolean) => {
    try {
      await togglePriceActive.mutateAsync({ id: priceId, active })
      addNotification({
        message: `Price ${active ? 'activated' : 'deactivated'} successfully`,
        type: 'success',
      })
    } catch {
      addNotification({ message: 'Failed to update price status', type: 'error' })
    }
  }

  const handleSyncPrice = async (productId: number, priceId: number) => {
    try {
      await syncPriceToStripe.mutateAsync(priceId)
      addNotification({ message: 'Price synced to Stripe successfully', type: 'success' })
    } catch {
      addNotification({ message: 'Failed to sync price to Stripe', type: 'error' })
    }
  }

  const handlePaginationChange = useCallback(
    (newPagination: { page: number; pageSize: number }) => {
      setPagination(newPagination)
    },
    [setPagination]
  )

  // Reconciliation handlers
  const handleVerifySync = async (product: AdminProduct) => {
    setVerifyingProductIds((prev) => new Set(prev).add(product.id))
    try {
      const status = await verifySync.mutateAsync(product.id)
      setVerifiedSyncStatus((prev) => new Map(prev).set(product.id, status.status))
      addNotification({ message: `Verified ${product.name}`, type: 'success' })
    } catch (e) {
      addNotification({ message: `Failed to verify ${product.name}`, type: 'error' })
    } finally {
      setVerifyingProductIds((prev) => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }
  }

  const handlePush = async (product: AdminProduct) => {
    try {
      await pushToStripe.mutateAsync(product.id)
      onReconciliationComplete()
    } catch {
      addNotification({ message: `Failed to push ${product.name}`, type: 'error' })
    }
  }

  const handlePull = async (product: AdminProduct) => {
    try {
      await pullFromStripe.mutateAsync(product.id)
      onReconciliationComplete()
    } catch {
      addNotification({ message: `Failed to pull ${product.name}`, type: 'error' })
    }
  }

  const handleUnlink = async (product: AdminProduct) => {
    try {
      await unlinkProduct.mutateAsync(product.id)
      onReconciliationComplete()
    } catch {
      addNotification({ message: `Failed to unlink ${product.name}`, type: 'error' })
    }
  }

  // Find selected price for edit dialog
  const selectedPrice = selectedPriceId
    ? data?.content.flatMap((p) => p.prices).find((p) => p.id === selectedPriceId)
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products & Prices</h1>
          <p className="text-muted-foreground">Manage subscription products and pricing tiers</p>
        </div>
        <DpButton
          variant="accent"
          onClick={() => {
            setSelectedProduct(null)
            setProductDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </DpButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats?.totalProducts ?? '-'} icon={Package} />
        <StatCard title="Active Products" value={stats?.activeProducts ?? '-'} icon={Box} />
        <StatCard title="Synced to Stripe" value={stats?.syncedProducts ?? '-'} icon={Cloud} />
        <StatCard title="Local Only" value={stats?.localOnlyProducts ?? '-'} icon={CloudOff} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <ProductsTable
        data={data}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onSync={handleSync}
        onAddPrice={handleAddPrice}
        onEditPrice={handleEditPrice}
        onDeletePrice={handleDeletePrice}
        onTogglePriceActive={handleTogglePriceActive}
        onSyncPrice={handleSyncPrice}
        onVerifySync={handleVerifySync}
        onPushToStripe={handlePush}
        onPullFromStripe={handlePull}
        onUnlink={handleUnlink}
        verifiedSyncStatus={verifiedSyncStatus}
        verifyingProductIds={verifyingProductIds}
      />

      {/* Reconciliation Panel */}
      <ReconciliationPanel onReconciliationComplete={onReconciliationComplete} />

      {/* Dialogs */}
      <ProductDialog open={productDialogOpen} onOpenChange={setProductDialogOpen} product={selectedProduct} />

      <PriceDialog
        open={priceDialogOpen}
        onOpenChange={setPriceDialogOpen}
        products={data?.content || []}
        defaultProductId={selectedProductForPrice ?? undefined}
        price={selectedPrice}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        isLoading={deleteProduct.isPending}
        variant="destructive"
      />

      <ConfirmDialog
        open={deletePriceDialogOpen}
        onOpenChange={setDeletePriceDialogOpen}
        title="Delete Price"
        description="Are you sure you want to delete this price? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDeletePrice}
        isLoading={deletePrice.isPending}
        variant="destructive"
      />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  )
}
