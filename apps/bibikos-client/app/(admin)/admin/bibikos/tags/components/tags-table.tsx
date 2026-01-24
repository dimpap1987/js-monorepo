'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { useNotifications } from '@js-monorepo/notification'
import { useState, useMemo } from 'react'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import {
  Tag,
  TagCategory,
  TAG_ENTITY_TYPE_LABELS,
  useDeleteTag,
  useDeleteTagCategory,
  useTagCategories,
  useTags,
} from '../queries'
import { CategoryDialog } from './category-dialog'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import { TagDialog } from './tag-dialog'

interface TagsByCategory {
  category: TagCategory | null
  tags: Tag[]
}

export function TagsTable() {
  const { data: categories = [], isLoading: categoriesLoading } = useTagCategories()
  const { data: tags = [], isLoading: tagsLoading } = useTags()
  const { addNotification } = useNotifications()

  const deleteTag = useDeleteTag()
  const deleteCategory = useDeleteTagCategory()

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Edit states
  const [editingCategory, setEditingCategory] = useState<TagCategory | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'tag' | 'category'; item: Tag | TagCategory } | null>(null)

  // Group tags by category
  const tagsByCategory = useMemo((): TagsByCategory[] => {
    const grouped = new Map<number | null, Tag[]>()

    // Initialize with all categories (including empty ones)
    categories.forEach((cat) => grouped.set(cat.id, []))
    grouped.set(null, []) // Uncategorized

    // Group tags
    tags.forEach((tag) => {
      const categoryId = tag.category?.id ?? null
      const existing = grouped.get(categoryId) ?? []
      grouped.set(categoryId, [...existing, tag])
    })

    // Convert to array
    const result: TagsByCategory[] = []

    // Add categorized tags
    categories.forEach((cat) => {
      result.push({
        category: cat,
        tags: grouped.get(cat.id) ?? [],
      })
    })

    // Add uncategorized tags at the end
    const uncategorized = grouped.get(null) ?? []
    if (uncategorized.length > 0 || categories.length === 0) {
      result.push({
        category: null,
        tags: uncategorized,
      })
    }

    return result
  }, [categories, tags])

  const handleEditCategory = (category: TagCategory) => {
    setEditingCategory(category)
    setCategoryDialogOpen(true)
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setTagDialogOpen(true)
  }

  const handleDeleteClick = (type: 'tag' | 'category', item: Tag | TagCategory) => {
    setDeleteTarget({ type, item })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      if (deleteTarget.type === 'tag') {
        await deleteTag.mutateAsync(deleteTarget.item.id)
        addNotification({ message: 'Tag deleted successfully', type: 'success' })
      } else {
        await deleteCategory.mutateAsync(deleteTarget.item.id)
        addNotification({ message: 'Category deleted successfully', type: 'success' })
      }
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch {
      addNotification({
        message: `Failed to delete ${deleteTarget.type}`,
        type: 'error',
      })
    }
  }

  const isLoading = categoriesLoading || tagsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading tags...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setEditingCategory(null)
            setCategoryDialogOpen(true)
          }}
          variant="outline"
        >
          <BiPlus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
        <Button
          onClick={() => {
            setEditingTag(null)
            setTagDialogOpen(true)
          }}
        >
          <BiPlus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {/* Tags grouped by category */}
      <div className="space-y-4">
        {tagsByCategory.map(({ category, tags: categoryTags }) => (
          <Card key={category?.id ?? 'uncategorized'}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{category?.name ?? 'Uncategorized'}</CardTitle>
                  {category && (
                    <CardDescription className="text-xs font-mono mt-1">slug: {category.slug}</CardDescription>
                  )}
                </div>
                {category && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                      <BiEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick('category', category)}
                      className="text-destructive hover:text-destructive"
                    >
                      <BiTrash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {categoryTags.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No tags in this category</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categoryTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="group flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm"
                    >
                      <span>{tag.name}</span>
                      {tag.applicableTo && tag.applicableTo.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          ({tag.applicableTo.map((t) => TAG_ENTITY_TYPE_LABELS[t].charAt(0)).join('')})
                        </span>
                      )}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditTag(tag)} className="p-0.5 hover:text-primary rounded">
                          <BiEdit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick('tag', tag)}
                          className="p-0.5 hover:text-destructive rounded"
                        >
                          <BiTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open)
          if (!open) setEditingCategory(null)
        }}
        category={editingCategory}
      />

      <TagDialog
        open={tagDialogOpen}
        onOpenChange={(open) => {
          setTagDialogOpen(open)
          if (!open) setEditingTag(null)
        }}
        tag={editingTag}
        categories={categories}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteTarget?.type === 'category' ? 'Category' : 'Tag'}`}
        description={
          deleteTarget?.type === 'category'
            ? `Are you sure you want to delete the category "${deleteTarget.item.name}"? Tags in this category will become uncategorized.`
            : `Are you sure you want to delete the tag "${deleteTarget?.item.name}"?`
        }
        isPending={deleteTag.isPending || deleteCategory.isPending}
      />
    </div>
  )
}
