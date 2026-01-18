'use client'

import { amountToCents, centsToAmount } from '@js-monorepo/currency'
import { Button } from '@js-monorepo/components/ui/button'
import { Form, FormControl, FormErrorDisplay, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Switch } from '@js-monorepo/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { AdminPrice, AdminProduct, CreatePriceRequest, UpdatePriceRequest } from '../../types'

const priceSchema = z.object({
  productId: z.coerce.number().int().positive('Product is required'),
  amount: z.coerce.number().min(0, 'Amount must be 0 or greater'),
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
  interval: z.enum(['month', 'year']),
  active: z.boolean(),
  syncToStripe: z.boolean().optional(),
})

type PriceFormValues = z.infer<typeof priceSchema>

interface PriceFormProps {
  price?: AdminPrice | null
  products: AdminProduct[]
  defaultProductId?: number
  onSubmit: (data: CreatePriceRequest | UpdatePriceRequest) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function PriceForm({ price, products, defaultProductId, onSubmit, onCancel, isLoading }: PriceFormProps) {
  const isEditMode = !!price

  // Find the selected product to check if it's synced to Stripe
  const selectedProductId = price?.productId || defaultProductId
  const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null
  const isProductSynced = selectedProduct ? !selectedProduct.stripeId.startsWith('local_') : false
  const isPriceLocal = price ? price.stripeId.startsWith('local_price_') : true

  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      productId: price?.productId || defaultProductId || 0,
      amount: price ? centsToAmount(price.unitAmount) : 0, // Convert cents to amount
      currency: price?.currency?.toUpperCase() || 'EUR',
      interval: (price?.interval as 'month' | 'year') || 'month',
      active: price?.active ?? true,
      // Auto-enable sync if product is synced and price is local (or new)
      // For synced prices, default to false (replacing is a significant action)
      syncToStripe: isProductSynced && (isPriceLocal || !isEditMode) && !(isEditMode && !isPriceLocal),
    },
  })

  // Watch productId to update syncToStripe when product changes
  const watchedProductId = form.watch('productId')
  useEffect(() => {
    if (!isEditMode && watchedProductId) {
      const selectedProductInner = products.find((p) => p.id === watchedProductId)
      const productIsSynced = selectedProductInner ? !selectedProductInner.stripeId.startsWith('local_') : false
      // Auto-enable sync if product is synced
      form.setValue('syncToStripe', productIsSynced)
    }
  }, [watchedProductId, products, isEditMode, form])

  const handleSubmit = async (data: PriceFormValues) => {
    const unitAmount = amountToCents(data.amount) // Convert amount to cents

    if (isEditMode) {
      await onSubmit({
        unitAmount,
        currency: data.currency.toLowerCase(),
        interval: data.interval,
        active: data.active,
        syncToStripe: data.syncToStripe,
      } as UpdatePriceRequest)
    } else {
      await onSubmit({
        productId: data.productId,
        unitAmount,
        currency: data.currency.toLowerCase(),
        interval: data.interval,
        active: data.active,
        syncToStripe: data.syncToStripe,
      } as CreatePriceRequest)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {!isEditMode && (
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormErrorDisplay errors={form.formState.errors} fields={{ productId: 'Product' }} />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.01} placeholder="0.00" {...field} />
                </FormControl>
                <p className="text-sm text-muted-foreground">Price in the selected currency</p>
                <FormErrorDisplay errors={form.formState.errors} fields={{ amount: 'Amount' }} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <FormErrorDisplay errors={form.formState.errors} fields={{ currency: 'Currency' }} />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Interval</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormErrorDisplay errors={form.formState.errors} fields={{ interval: 'Interval' }} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <p className="text-sm text-muted-foreground">Inactive prices are hidden from users</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="syncToStripe"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {isEditMode && !isPriceLocal ? 'Replace Price in Stripe' : 'Sync to Stripe'}
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  {isEditMode && !isPriceLocal
                    ? 'Create a new price in Stripe with these changes and deactivate the old one (Stripe prices are immutable)'
                    : isEditMode && isPriceLocal
                      ? 'Sync this local price to Stripe (requires product to be synced)'
                      : isProductSynced
                        ? 'Automatically sync this price to Stripe when created'
                        : 'Create this price in Stripe immediately (requires product to be synced first)'}
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!isProductSynced} />
              </FormControl>
            </FormItem>
          )}
        />
        {isEditMode && !isPriceLocal && (
          <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">⚠️ Stripe Price Immutability</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This price is synced to Stripe. Stripe prices are <strong>immutable</strong> - you cannot change the
                amount, currency, or interval of an existing Stripe price.
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
                <li>
                  <strong>Active status</strong> can be updated directly in Stripe (no new price needed)
                </li>
                <li>
                  <strong>Amount, currency, or interval</strong> changes require creating a new price
                </li>
              </ul>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                If you enable "Replace Price in Stripe" below, a <strong>new price will be created</strong> in Stripe
                with your changes, and the old price will be <strong>deactivated</strong>. This ensures checkout uses
                the updated price.
              </p>
            </div>
          </div>
        )}
        {!isProductSynced && !isEditMode && (
          <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ The selected product must be synced to Stripe before you can sync prices. Sync the product first, then
              create prices.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="accent" disabled={isLoading || !form.formState.isValid}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Price' : 'Create Price'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
