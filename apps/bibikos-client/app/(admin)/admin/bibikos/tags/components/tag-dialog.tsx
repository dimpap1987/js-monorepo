'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@js-monorepo/components/ui/button'
import { Checkbox } from '@js-monorepo/components/ui/checkbox'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { useNotifications } from '@js-monorepo/notification'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Tag,
  TagCategory,
  TAG_ENTITY_TYPES,
  TAG_ENTITY_TYPE_LABELS,
  TagEntityType,
  useCreateTag,
  useUpdateTag,
} from '../queries'

const UNCATEGORIZED_VALUE = '__uncategorized__'

const tagFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  categoryId: z.string(),
  applicableTo: z.array(z.enum(TAG_ENTITY_TYPES)),
})

type TagFormValues = z.infer<typeof tagFormSchema>

interface TagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag?: Tag | null
  categories: TagCategory[]
}

export function TagDialog({ open, onOpenChange, tag, categories }: TagDialogProps) {
  const { addNotification } = useNotifications()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()

  const isEditMode = !!tag

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: '',
      categoryId: UNCATEGORIZED_VALUE,
      applicableTo: [],
    },
  })

  // Reset form when dialog opens/closes or tag changes
  useEffect(() => {
    if (open) {
      if (tag) {
        form.reset({
          name: tag.name,
          categoryId: tag.category?.id?.toString() ?? UNCATEGORIZED_VALUE,
          applicableTo: tag.applicableTo ?? [],
        })
      } else {
        form.reset({
          name: '',
          categoryId: UNCATEGORIZED_VALUE,
          applicableTo: [],
        })
      }
    }
  }, [open, tag, form])

  const onSubmit = async (data: TagFormValues) => {
    const parsedCategoryId = data.categoryId === UNCATEGORIZED_VALUE ? undefined : parseInt(data.categoryId, 10)

    try {
      if (isEditMode && tag) {
        await updateTag.mutateAsync({
          id: tag.id,
          payload: {
            name: data.name,
            categoryId: parsedCategoryId ?? null,
            applicableTo: data.applicableTo,
          },
        })
        addNotification({ message: 'Tag updated successfully', type: 'success' })
      } else {
        await createTag.mutateAsync({
          name: data.name,
          categoryId: parsedCategoryId,
          applicableTo: data.applicableTo,
        })
        addNotification({ message: 'Tag created successfully', type: 'success' })
      }
      onOpenChange(false)
    } catch {
      addNotification({
        message: isEditMode ? 'Failed to update tag' : 'Failed to create tag',
        type: 'error',
      })
    }
  }

  const isPending = createTag.isPending || updateTag.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
          <DialogDescription>{isEditMode ? 'Update the tag details below.' : 'Add a new tag.'}</DialogDescription>
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
                    <Input placeholder="e.g., Yoga" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UNCATEGORIZED_VALUE}>Uncategorized</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicableTo"
              render={() => (
                <FormItem>
                  <FormLabel>Applicable To</FormLabel>
                  <FormDescription>
                    Select which entity types this tag can be assigned to. Leave empty for all.
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {TAG_ENTITY_TYPES.map((entityType) => (
                      <FormField
                        key={entityType}
                        control={form.control}
                        name="applicableTo"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(entityType)}
                                disabled={isPending}
                                onCheckedChange={(checked) => {
                                  const current = field.value ?? []
                                  if (checked) {
                                    field.onChange([...current, entityType])
                                  } else {
                                    field.onChange(current.filter((v: TagEntityType) => v !== entityType))
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {TAG_ENTITY_TYPE_LABELS[entityType]}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
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
