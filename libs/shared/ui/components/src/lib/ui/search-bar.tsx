'use client'

import { Input } from './form'
import { Button } from './button'
import { Search, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@js-monorepo/ui/util'
import { useDebounce } from '@js-monorepo/next/hooks/use-debounce'

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (query: string) => void
  suggestions?: string[]
  recentSearches?: string[]
  debounceMs?: number
  showClearButton?: boolean
  showSuggestions?: boolean
}

export function SearchBar({
  onSearch,
  placeholder = 'Search...',
  suggestions = [],
  recentSearches = [],
  debounceMs = 300,
  showClearButton = true,
  showSuggestions = true,
  className,
  value: controlledValue,
  onChange,
  ...props
}: SearchBarProps) {
  const [query, setQuery] = useState<string>(controlledValue?.toString() || '')
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const debouncedQuery = useDebounce(query, debounceMs)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle controlled/uncontrolled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setQuery(controlledValue.toString())
    }
  }, [controlledValue])

  // Call onSearch when debounced query changes
  useEffect(() => {
    if (onSearch && debouncedQuery !== undefined) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestionsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    setShowSuggestionsDropdown(true)
    onChange?.(e)
  }

  const handleClear = () => {
    setQuery('')
    setShowSuggestionsDropdown(false)
    onSearch?.('')
    // Create a synthetic event for onChange
    const syntheticEvent = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>
    onChange?.(syntheticEvent)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestionsDropdown(false)
    onSearch?.(suggestion)
    // Create a synthetic event for onChange
    const syntheticEvent = {
      target: { value: suggestion },
    } as React.ChangeEvent<HTMLInputElement>
    onChange?.(syntheticEvent)
  }

  const hasSuggestions = showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)
  const shouldShowDropdown = showSuggestionsDropdown && hasSuggestions && isFocused

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
          size={16}
        />
        <Input
          value={query}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true)
            setShowSuggestionsDropdown(true)
          }}
          onBlur={() => {
            // Delay to allow suggestion clicks
            setTimeout(() => setIsFocused(false), 200)
          }}
          placeholder={placeholder}
          className={cn('pl-10', showClearButton && query && 'pr-10')}
          {...props}
        />
        {showClearButton && query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-accent"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {shouldShowDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">Suggestions</div>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full text-left px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded text-sm transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          {recentSearches.length > 0 && (
            <div className={cn('p-2', suggestions.length > 0 && 'border-t border-border')}>
              <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">Recent</div>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full text-left px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded text-sm transition-colors"
                  onClick={() => handleSuggestionClick(search)}
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
