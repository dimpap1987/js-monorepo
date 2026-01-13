'use client'

import { DpButton } from '@js-monorepo/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@js-monorepo/components/ui/dialog'
import { useNotifications } from '@js-monorepo/notification'
import {
  AdminPrice,
  AdminProduct,
  CreatePriceRequest,
  PriceForm,
  StripeSyncBadge,
  SyncStatus,
  UpdatePriceRequest,
  useCreatePrice,
  useSyncPriceToStripe,
  useUpdatePrice,
} from '@js-monorepo/payments-ui'
import { Cloud, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface PriceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: AdminProduct[]
  defaultProductId?: number
  price?: AdminPrice | null
  verifiedPriceSyncStatus?: SyncStatus
}

export function PriceDialog({
  open,
  onOpenChange,
  products,
  defaultProductId,
  price,
  verifiedPriceSyncStatus,
}: PriceDialogProps) {
  const { addNotification } = useNotifications()
  const createPrice = useCreatePrice()
  const updatePrice = useUpdatePrice()
  const syncPriceToStripe = useSyncPriceToStripe()
  const isEditMode = !!price
  const [savedPriceId, setSavedPriceId] = useState<number | null>(null)
  const [savedPrice, setSavedPrice] = useState<AdminPrice | null>(null)
  const [showSyncButton, setShowSyncButton] = useState(false)

  // Find the product to check if it's synced
  const selectedProductId = price?.productId || defaultProductId
  const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null
  const isProductSynced = selectedProduct ? !selectedProduct.stripeId.startsWith('local_') : false

  // Determine price sync status
  // Use verified status if available, otherwise infer from stripeId
  const getPriceSyncStatus = (): SyncStatus | undefined => {
    // If we have a verified status, use it (most accurate)
    if (verifiedPriceSyncStatus) {
      return verifiedPriceSyncStatus
    }

    const priceToCheck = price || savedPrice
    if (!priceToCheck) return undefined

    if (priceToCheck.stripeId.startsWith('local_price_')) {
      return SyncStatus.LOCAL_ONLY
    }
    // If it has a stripeId but we're not sure if it exists, default to SYNCED
    // The actual status should come from verification
    return SyncStatus.SYNCED
  }

  const priceSyncStatus = getPriceSyncStatus()

  // Check if price can be synced (must be local, orphaned, or product must be synced)
  // Orphaned prices (have stripeId but don't exist in Stripe) can be re-synced
  const priceIsLocal = price
    ? price.stripeId.startsWith('local_price_')
    : savedPrice
      ? savedPrice.stripeId.startsWith('local_price_')
      : savedPriceId
        ? true
        : false

  // Price can be synced if:
  // 1. It's local AND product is synced, OR
  // 2. It's orphaned (has stripeId but doesn't exist in Stripe) - we'll check this via the status
  const isOrphaned = priceSyncStatus === SyncStatus.ORPHANED
  const canSync = (priceIsLocal || isOrphaned) && isProductSynced

  const handleSubmit = async (data: CreatePriceRequest | UpdatePriceRequest) => {
    try {
      if (isEditMode && price) {
        const updateData = data as UpdatePriceRequest
        const result = await updatePrice.mutateAsync({ id: price.id, data: updateData })

        // If syncing to Stripe, show appropriate message
        if (updateData.syncToStripe) {
          addNotification({ message: 'Price updated and synced to Stripe successfully', type: 'success' })
          setShowSyncButton(false)
          onOpenChange(false)
        } else {
          addNotification({ message: 'Price updated successfully', type: 'success' })
          // Show sync button if price can be synced (local or orphaned) and product is synced
          const updatedPriceIsLocal = result.stripeId.startsWith('local_price_')
          if ((updatedPriceIsLocal || isOrphaned) && isProductSynced) {
            setSavedPriceId(result.id)
            setSavedPrice(result)
            setShowSyncButton(true)
          } else {
            onOpenChange(false)
          }
        }
      } else {
        const createData = data as CreatePriceRequest
        const result = await createPrice.mutateAsync(createData)

        // If syncing to Stripe, show appropriate message
        if (createData.syncToStripe) {
          addNotification({ message: 'Price created and synced to Stripe successfully', type: 'success' })
          setShowSyncButton(false)
          onOpenChange(false)
        } else {
          addNotification({ message: 'Price created successfully', type: 'success' })
          // Show sync button if price is local and product is synced
          if (result.stripeId.startsWith('local_price_') && isProductSynced) {
            setSavedPriceId(result.id)
            setSavedPrice(result)
            setShowSyncButton(true)
          } else {
            onOpenChange(false)
          }
        }
      }
    } catch (error) {
      addNotification({
        message: isEditMode ? 'Failed to update price' : 'Failed to create price',
        type: 'error',
      })
    }
  }

  const handleManualSync = async () => {
    const priceIdToSync = savedPriceId || price?.id
    if (!priceIdToSync) return

    try {
      const result = await syncPriceToStripe.mutateAsync(priceIdToSync)
      addNotification({ message: 'Price synced to Stripe successfully', type: 'success' })
      setShowSyncButton(false)
      setSavedPriceId(null)
      setSavedPrice(result)
      onOpenChange(false)
    } catch (error) {
      addNotification({ message: 'Failed to sync price to Stripe', type: 'error' })
    }
  }

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSavedPriceId(null)
      setSavedPrice(null)
      setShowSyncButton(false)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{isEditMode ? 'Edit Price' : 'Add Price'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update the price details below.' : 'Create a new price tier for this product.'}
              </DialogDescription>
            </div>
            {(isEditMode || savedPrice) && priceSyncStatus && (
              <div className="flex items-center justify-end">
                <StripeSyncBadge verifiedStatus={priceSyncStatus} />
              </div>
            )}
          </div>
        </DialogHeader>
        <PriceForm
          price={price}
          products={products}
          defaultProductId={defaultProductId}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isLoading={createPrice.isPending || updatePrice.isPending}
        />
        {(showSyncButton || (isEditMode && canSync)) && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {showSyncButton && (
              <DpButton
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={syncPriceToStripe.isPending}
              >
                Close
              </DpButton>
            )}
            {canSync && (
              <DpButton
                type="button"
                variant="accent"
                onClick={handleManualSync}
                disabled={syncPriceToStripe.isPending || createPrice.isPending || updatePrice.isPending}
              >
                {syncPriceToStripe.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Sync to Stripe' : 'Sync to Stripe Now'}
                  </>
                )}
              </DpButton>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
