'use client'

import { DpButton } from '@js-monorepo/button'
import { Form, FormControl, FormErrorDisplay, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Switch } from '@js-monorepo/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
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

  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      productId: price?.productId || defaultProductId || 0,
      amount: price ? price.unitAmount / 100 : 0,
      currency: price?.currency?.toUpperCase() || 'EUR',
      interval: (price?.interval as 'month' | 'year') || 'month',
      active: price?.active ?? true,
      syncToStripe: false,
    },
  })

  const handleSubmit = async (data: PriceFormValues) => {
    const unitAmount = Math.round(data.amount * 100) // Convert to cents

    if (isEditMode) {
      await onSubmit({
        unitAmount,
        currency: data.currency.toLowerCase(),
        interval: data.interval,
        active: data.active,
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

        {!isEditMode && (
          <FormField
            control={form.control}
            name="syncToStripe"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Sync to Stripe</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Create this price in Stripe immediately (requires product to be synced)
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <DpButton type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </DpButton>
          )}
          <DpButton type="submit" variant="accent" disabled={isLoading || !form.formState.isValid}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Price' : 'Create Price'}
          </DpButton>
        </div>
      </form>
    </Form>
  )
}
