'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { cn } from '@js-monorepo/ui/util'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BiX, BiChevronDown, BiSearch } from 'react-icons/bi'
import { useClickAway } from 'react-use'
import { Tag, TagEntityType, useTagsByEntityType } from './queries'

export interface TagSelectProps {
  /** Entity type to filter available tags */
  entityType: TagEntityType
  /** Currently selected tag IDs */
  value: number[]
  /** Callback when selection changes */
  onChange: (tagIds: number[]) => void
  /** Placeholder text when no tags selected */
  placeholder?: string
  /** Label for the field */
  label?: string
  /** Additional class name for the container */
  className?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Group tags by category in the dropdown */
  groupByCategory?: boolean
}

export function TagSelect({
  entityType,
  value,
  onChange,
  placeholder = 'Select tags...',
  label,
  className,
  disabled = false,
  groupByCategory = true,
}: TagSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: availableTags = [], isLoading } = useTagsByEntityType(entityType)

  useClickAway(containerRef, () => {
    setIsOpen(false)
    setSearchQuery('')
  })

  // Get selected tags objects
  const selectedTags = useMemo(() => {
    return availableTags.filter((tag) => value.includes(tag.id))
  }, [availableTags, value])

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return availableTags
    const query = searchQuery.toLowerCase()
    return availableTags.filter(
      (tag) => tag.name.toLowerCase().includes(query) || tag.category?.name.toLowerCase().includes(query)
    )
  }, [availableTags, searchQuery])

  // Group filtered tags by category
  const groupedTags = useMemo(() => {
    if (!groupByCategory) {
      return [{ category: null, tags: filteredTags }]
    }

    const groups = new Map<string | null, Tag[]>()

    // Initialize with uncategorized
    groups.set(null, [])

    filteredTags.forEach((tag) => {
      const categoryKey = tag.category?.name ?? null
      if (!groups.has(categoryKey)) {
        groups.set(categoryKey, [])
      }
      groups.get(categoryKey)!.push(tag)
    })

    // Convert to array and sort: categories first, then uncategorized
    const result: { category: string | null; tags: Tag[] }[] = []

    // Add categorized tags first
    groups.forEach((tags, category) => {
      if (category !== null && tags.length > 0) {
        result.push({ category, tags })
      }
    })

    // Sort categories alphabetically
    result.sort((a, b) => (a.category ?? '').localeCompare(b.category ?? ''))

    // Add uncategorized at the end if there are any
    const uncategorized = groups.get(null) ?? []
    if (uncategorized.length > 0) {
      result.push({ category: null, tags: uncategorized })
    }

    return result
  }, [filteredTags, groupByCategory])

  const handleTagToggle = useCallback(
    (tagId: number) => {
      const newValue = value.includes(tagId) ? value.filter((id) => id !== tagId) : [...value, tagId]
      onChange(newValue)
    },
    [value, onChange]
  )

  const handleRemoveTag = useCallback(
    (tagId: number, e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(value.filter((id) => id !== tagId))
    },
    [value, onChange]
  )

  const handleContainerClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(true)
      inputRef.current?.focus()
    }
  }, [disabled])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearchQuery('')
      } else if (e.key === 'Backspace' && !searchQuery && selectedTags.length > 0) {
        // Remove last selected tag on backspace when input is empty
        const lastTag = selectedTags[selectedTags.length - 1]
        onChange(value.filter((id) => id !== lastTag.id))
      }
    },
    [searchQuery, selectedTags, value, onChange]
  )

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}

      {/* Selected tags and input container */}
      <div
        onClick={handleContainerClick}
        className={cn(
          'flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 rounded-md border bg-background',
          'cursor-text transition-colors',
          isOpen ? 'border-ring ring-1 ring-ring' : 'border-input',
          disabled && 'opacity-50 cursor-not-allowed bg-muted'
        )}
      >
        {/* Selected tags as badges */}
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="flex items-center gap-1 pr-1 text-sm font-normal ">
            <span>{tag.name}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => handleRemoveTag(tag.id, e)}
                className="rounded-full hover:bg-muted-foreground p-0.5"
              >
                <BiX className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          disabled={disabled}
          className={cn(
            'flex-1 min-w-[120px] bg-transparent outline-none text-sm',
            'placeholder:text-muted-foreground',
            disabled && 'cursor-not-allowed'
          )}
        />

        {/* Dropdown indicator */}
        <BiChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 py-1 bg-popover border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading tags...</div>
          ) : filteredTags.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {searchQuery ? 'No tags found' : 'No tags available'}
            </div>
          ) : (
            groupedTags.map(({ category, tags }) => (
              <div key={category ?? 'uncategorized'}>
                {/* Category header */}
                {groupByCategory && (
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                    {category ?? ''}
                  </div>
                )}

                {/* Tags in this category */}
                {tags.map((tag) => {
                  const isSelected = value.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm flex items-center justify-between',
                        'hover:bg-accent hover:text-accent-foreground transition-colors',
                        isSelected && 'bg-accent/50'
                      )}
                    >
                      <span>{tag.name}</span>
                      {isSelected && (
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
