'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import { useNotifications } from '@js-monorepo/notification'
import {
  AdminProduct,
  CreateProductRequest,
  ProductForm,
  UpdateProductRequest,
  useCreateProduct,
  useUpdateProduct,
} from '@js-monorepo/payments-ui'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: AdminProduct | null
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const { addNotification } = useNotifications()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const isEditMode = !!product

  const handleSubmit = async (data: CreateProductRequest | UpdateProductRequest) => {
    try {
      if (isEditMode && product) {
        await updateProduct.mutateAsync({ id: product.id, data: data as UpdateProductRequest })
        addNotification({ message: 'Product updated successfully', type: 'success' })
      } else {
        await createProduct.mutateAsync(data as CreateProductRequest)
        addNotification({ message: 'Product created successfully', type: 'success' })
      }
      onOpenChange(false)
    } catch (error) {
      addNotification({
        message: isEditMode ? 'Failed to update product' : 'Failed to create product',
        type: 'error',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Create Product'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the product details below.'
              : 'Fill in the details to create a new subscription product.'}
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={createProduct.isPending || updateProduct.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
