'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Form, FormControl, FormErrorDisplay, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { Switch } from '@js-monorepo/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { AdminProduct, CreateProductRequest, UpdateProductRequest } from '../../types'
import { FeaturesEditor } from './features-editor'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  features: z.record(z.string(), z.string()).optional(),
  hierarchy: z.coerce.number().int().min(0, 'Hierarchy must be 0 or greater'),
  active: z.boolean(),
  syncToStripe: z.boolean().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: AdminProduct | null
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const isEditMode = !!product

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      features: product?.metadata?.features || {},
      hierarchy: product?.hierarchy ?? 0,
      active: product?.active ?? true,
      syncToStripe: false,
    },
  })

  const handleSubmit = async (data: ProductFormValues) => {
    const features = data.features && Object.keys(data.features).length > 0 ? data.features : undefined
    await onSubmit({
      name: data.name,
      description: data.description,
      metadata: { ...(product?.metadata ?? {}), features },
      hierarchy: data.hierarchy,
      active: data.active,
      ...(isEditMode ? {} : { syncToStripe: data.syncToStripe }),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Pro Plan" {...field} />
              </FormControl>
              <FormErrorDisplay errors={form.formState.errors} fields={{ name: 'Name' }} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  placeholder="Describe what this product offers..."
                  className="w-full border border-border rounded-lg p-3 bg-background text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormErrorDisplay errors={form.formState.errors} fields={{ description: 'Description' }} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hierarchy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hierarchy (Plan Level)</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...field} />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Higher number = higher tier plan. Used for access control (e.g., 0=free, 1=basic, 2=pro)
              </p>
              <FormErrorDisplay errors={form.formState.errors} fields={{ hierarchy: 'Hierarchy' }} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features</FormLabel>
              <FormControl>
                <FeaturesEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Define features as key-value pairs. Keys are used for programmatic access, values are displayed to
                users.
              </p>
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
                <p className="text-sm text-muted-foreground">
                  Inactive products are hidden from users on the pricing page
                </p>
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
                    Create this product in Stripe immediately. You can also sync later.
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
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="accent" disabled={isLoading || !form.formState.isValid}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
