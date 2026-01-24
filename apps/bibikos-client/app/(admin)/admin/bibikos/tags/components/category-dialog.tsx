'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@js-monorepo/components/ui/button'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@js-monorepo/components/ui/form'
import { useNotifications } from '@js-monorepo/notification'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { TagCategory, useCreateTagCategory, useUpdateTagCategory } from '../queries'

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be 50 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: TagCategory | null
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const { addNotification } = useNotifications()
  const createCategory = useCreateTagCategory()
  const updateCategory = useUpdateTagCategory()

  const isEditMode = !!category

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  })

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.name,
          slug: category.slug,
        })
      } else {
        form.reset({
          name: '',
          slug: '',
        })
      }
    }
  }, [open, category, form])

  // Auto-generate slug from name (only for new categories)
  const watchedName = form.watch('name')
  useEffect(() => {
    if (!isEditMode && watchedName && !form.getFieldState('slug').isDirty) {
      form.setValue('slug', generateSlug(watchedName), { shouldValidate: false })
    }
  }, [watchedName, isEditMode, form])

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (isEditMode && category) {
        await updateCategory.mutateAsync({
          id: category.id,
          payload: { name: data.name, slug: data.slug },
        })
        addNotification({ message: 'Category updated successfully', type: 'success' })
      } else {
        await createCategory.mutateAsync({ name: data.name, slug: data.slug })
        addNotification({ message: 'Category created successfully', type: 'success' })
      }
      onOpenChange(false)
    } catch {
      addNotification({
        message: isEditMode ? 'Failed to update category' : 'Failed to create category',
        type: 'error',
      })
    }
  }

  const isPending = createCategory.isPending || updateCategory.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the category details below.' : 'Add a new tag category.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Activity Type" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., activity-type" disabled={isPending} {...field} />
                  </FormControl>
                  <FormDescription>URL-safe identifier (lowercase, hyphens only)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
