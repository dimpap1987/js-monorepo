'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { DpButton } from '@js-monorepo/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@js-monorepo/components/ui/dialog'
import {
  Form,
  FormControl,
  FormErrorDisplay,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { useAdminPrices, useAdminProducts } from '@js-monorepo/payments-ui'
import { AuthUserFullDto } from '@js-monorepo/types/auth'

const assignTrialSchema = z.object({
  productId: z.coerce.number().int().positive('Product is required'),
  priceId: z.coerce.number().int().positive('Price is required'),
  trialDurationDays: z.coerce
    .number()
    .int()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days'),
})

type AssignTrialFormValues = z.infer<typeof assignTrialSchema>

interface AssignTrialDialogProps {
  user: AuthUserFullDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssign: (userId: number, priceId: number, trialDurationDays: number) => Promise<void>
  isLoading?: boolean
}

export function AssignTrialDialog({ user, open, onOpenChange, onAssign, isLoading = false }: AssignTrialDialogProps) {
  // Fetch all products (active only for selection)
  const { data: productsData } = useAdminProducts(1, 100, { active: true })
  const products = productsData?.content || []

  const form = useForm<AssignTrialFormValues>({
    resolver: zodResolver(assignTrialSchema),
    defaultValues: {
      productId: 0,
      priceId: 0,
      trialDurationDays: 7,
    },
  })

  // Watch productId to fetch prices when product changes
  const watchedProductId = form.watch('productId')
  const { data: prices } = useAdminPrices(watchedProductId || undefined)

  // Filter active prices
  const activePrices = useMemo(() => {
    return prices?.filter((price) => price.status === 'active') || []
  }, [prices])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        productId: 0,
        priceId: 0,
        trialDurationDays: 7,
      })
    }
  }, [open, form])

  // Reset priceId when product changes
  useEffect(() => {
    if (watchedProductId) {
      form.setValue('priceId', 0)
    }
  }, [watchedProductId, form])

  const onSubmit = async (values: AssignTrialFormValues) => {
    if (!user) return
    await onAssign(user.id, values.priceId, values.trialDurationDays)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Assign Trial</DialogTitle>
              <DialogDescription>
                Assign a trial subscription to {user?.username || 'this user'}. This will bypass normal eligibility
                checks.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Product Selection */}
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      value={field.value?.toString() || ''}
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

              {/* Price Selection - Only show if product is selected */}
              {watchedProductId > 0 && (
                <FormField
                  control={form.control}
                  name="priceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value, 10))}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a price" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activePrices.length === 0 ? (
                            <SelectItem value="no-prices" disabled>
                              No active prices available
                            </SelectItem>
                          ) : (
                            activePrices.map((price) => {
                              const amount = (price.unitAmount / 100).toFixed(2)
                              const currency = price.currency.toUpperCase()
                              const interval = price.interval === 'month' ? 'mo' : 'yr'
                              return (
                                <SelectItem key={price.id} value={price.id.toString()}>
                                  {currency} {amount}/{interval}
                                </SelectItem>
                              )
                            })
                          )}
                        </SelectContent>
                      </Select>
                      <FormErrorDisplay errors={form.formState.errors} fields={{ priceId: 'Price' }} />
                    </FormItem>
                  )}
                />
              )}

              {/* Trial Duration */}
              <FormField
                control={form.control}
                name="trialDurationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trial Duration (days)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={365} placeholder="7" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Enter a value between 1 and 365 days</p>
                    <FormErrorDisplay errors={form.formState.errors} fields={{ trialDurationDays: 'Trial Duration' }} />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DpButton type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </DpButton>
              <DpButton type="submit" variant="accent" disabled={isLoading} loading={isLoading}>
                Assign Trial
              </DpButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
