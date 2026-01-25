'use client'

import { cn } from '@js-monorepo/ui/util'
import { Check } from 'lucide-react'
import { useMemo } from 'react'
import { Tag, TagEntityType, useTagsByEntityType } from './queries'

export interface TagFilterProps {
  /** Entity type to filter available tags */
  entityType: TagEntityType
  /** Currently selected tag IDs */
  value: number[]
  /** Callback when selection changes */
  onChange: (tagIds: number[]) => void
  /** Additional class name for the container */
  className?: string
  /** Group tags by category */
  groupByCategory?: boolean
  /** Show "All" option to clear selection */
  showAllOption?: boolean
  /** Label for the "All" option */
  allLabel?: string
}

interface TagChipProps {
  tag: Tag
  isSelected: boolean
  onToggle: () => void
}

function TagChip({ tag, isSelected, onToggle }: TagChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium shrink-0',
        'border transition-all duration-200 whitespace-nowrap',
        'focus:outline-none focus:ring-1 focus:ring-ring focus:ring-inset',
        isSelected
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-background text-foreground border-border hover:bg-accent hover:border-accent-foreground'
      )}
    >
      {isSelected && <Check className="w-3.5 h-3.5" />}
      <span>{tag.name}</span>
    </button>
  )
}

export function TagFilter({
  entityType,
  value,
  onChange,
  className,
  groupByCategory = false,
  showAllOption = true,
  allLabel = 'All',
}: TagFilterProps) {
  const { data: availableTags = [], isLoading } = useTagsByEntityType(entityType)

  // Group tags by category
  const groupedTags = useMemo(() => {
    if (!groupByCategory) {
      return [{ category: null, tags: availableTags }]
    }

    const groups = new Map<string | null, Tag[]>()
    groups.set(null, [])

    availableTags.forEach((tag) => {
      const categoryKey = tag.category?.name ?? null
      if (!groups.has(categoryKey)) {
        groups.set(categoryKey, [])
      }
      groups.get(categoryKey)!.push(tag)
    })

    const result: { category: string | null; tags: Tag[] }[] = []

    groups.forEach((tags, category) => {
      if (category !== null && tags.length > 0) {
        result.push({ category, tags })
      }
    })

    result.sort((a, b) => (a.category ?? '').localeCompare(b.category ?? ''))

    const uncategorized = groups.get(null) ?? []
    if (uncategorized.length > 0) {
      result.push({ category: null, tags: uncategorized })
    }

    return result
  }, [availableTags, groupByCategory])

  const handleTagToggle = (tagId: number) => {
    const newValue = value.includes(tagId) ? value.filter((id) => id !== tagId) : [...value, tagId]
    onChange(newValue)
  }

  const handleClearAll = () => {
    onChange([])
  }

  if (isLoading) {
    return (
      <div className={cn('flex gap-2', className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (availableTags.length === 0) {
    return null
  }

  const hasSelection = value.length > 0

  return (
    <div
      className={cn(
        'flex gap-2 py-2 px-1',
        // Mobile: horizontal scroll, no wrap, hidden scrollbar
        'overflow-x-auto flex-nowrap pb-1 -mb-1',
        'scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]',
        // Desktop: wrap normally
        'md:flex-wrap md:overflow-visible md:pb-0 md:-mb-0',
        className
      )}
    >
      {/* All option */}
      {showAllOption && (
        <button
          type="button"
          onClick={handleClearAll}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shrink-0',
            'border transition-all duration-200 whitespace-nowrap',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            !hasSelection
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-background text-foreground border-border hover:bg-accent hover:border-accent-foreground'
          )}
        >
          {!hasSelection && <Check className="w-3.5 h-3.5" />}
          <span>{allLabel}</span>
        </button>
      )}

      {/* Tags grouped or flat */}
      {groupedTags.map(({ category, tags }) => (
        <div key={category ?? 'uncategorized'} className="contents">
          {/* Category separator */}
          {groupByCategory && category && (
            <div className="flex items-center px-2 shrink-0">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider whitespace-nowrap">
                {category}
              </span>
            </div>
          )}

          {/* Tags */}
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              isSelected={value.includes(tag.id)}
              onToggle={() => handleTagToggle(tag.id)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
