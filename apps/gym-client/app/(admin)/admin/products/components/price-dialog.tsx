'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import { useNotifications } from '@js-monorepo/notification'
import {
  AdminPrice,
  AdminProduct,
  CreatePriceRequest,
  PriceForm,
  UpdatePriceRequest,
  useCreatePrice,
  useUpdatePrice,
} from '@js-monorepo/payments-ui'

interface PriceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: AdminProduct[]
  defaultProductId?: number
  price?: AdminPrice | null
}

export function PriceDialog({ open, onOpenChange, products, defaultProductId, price }: PriceDialogProps) {
  const { addNotification } = useNotifications()
  const createPrice = useCreatePrice()
  const updatePrice = useUpdatePrice()
  const isEditMode = !!price

  const handleSubmit = async (data: CreatePriceRequest | UpdatePriceRequest) => {
    try {
      if (isEditMode && price) {
        await updatePrice.mutateAsync({ id: price.id, data: data as UpdatePriceRequest })
        addNotification({ message: 'Price updated successfully', type: 'success' })
      } else {
        await createPrice.mutateAsync(data as CreatePriceRequest)
        addNotification({ message: 'Price created successfully', type: 'success' })
      }
      onOpenChange(false)
    } catch (error) {
      addNotification({
        message: isEditMode ? 'Failed to update price' : 'Failed to create price',
        type: 'error',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Price' : 'Add Price'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the price details below.' : 'Create a new price tier for this product.'}
          </DialogDescription>
        </DialogHeader>
        <PriceForm
          price={price}
          products={products}
          defaultProductId={defaultProductId}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={createPrice.isPending || updatePrice.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
