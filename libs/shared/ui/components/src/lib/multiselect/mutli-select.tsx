'use client'

import { cn } from '@js-monorepo/ui/util'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown'

export type OptionType = {
  id: number
  name: string
}

interface MultiSelectDropdownProps {
  formFieldName?: string
  options: OptionType[]
  onChange: (selectedOptions: OptionType[]) => void
  prompt?: string
  selectedIds?: (number | string)[]
  className?: string
  classNameTrigger?: string
}

export function MultiSelectDropdown({
  options,
  onChange,
  prompt = 'Select',
  selectedIds = [],
  className,
  classNameTrigger,
}: MultiSelectDropdownProps) {
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const dropdownContentRef = useRef<HTMLDivElement | null>(null)
  const dropdownTriggerRef = useRef<HTMLButtonElement | null>(null)

  function constructLabel(newOptions: OptionType[]) {
    const localLabel = options
      .filter((opt) => newOptions.some((s) => s.id === opt.id))
      .map((opt) => opt.name)
      .join(', ')

    return localLabel ? localLabel : prompt
  }

  const label = useMemo(
    () => constructLabel(selectedOptions),
    [selectedOptions]
  )

  useClickAway(dropdownContentRef, (event) => {
    if (dropdownTriggerRef.current?.contains(event.target as Node)) {
      return
    }
    setIsOpen(false)
  })

  useEffect(() => {
    const initialSelectedOptions = options.filter((option) =>
      selectedIds.includes(option.id)
    )
    setSelectedOptions(initialSelectedOptions)
  }, [options, selectedIds])

  const handleChange = (option: OptionType) => {
    const isSelected = selectedOptions.some(
      (selected) => selected.id === option.id
    )

    const newSelectedOptions = isSelected
      ? selectedOptions.filter((selected) => selected.id !== option.id)
      : [...selectedOptions, option]

    setSelectedOptions(newSelectedOptions)
    onChange(newSelectedOptions)
  }

  const handleSelectAll = () => {
    if (selectedOptions.length === options.length) {
      // If all are selected, deselect all
      setSelectedOptions([])
      onChange([])
    } else {
      // Select all options
      setSelectedOptions(options)
      onChange(options)
    }
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(change) => change && setIsOpen(true)}
      modal={true}
    >
      <DropdownMenuTrigger
        ref={dropdownTriggerRef}
        asChild
        className={cn(
          'w-full border-2 border-border rounded-lg text-foreground hide-scrollbar text-foreground',
          'px-6 py-1 text-base hover:border-border/80 cursor-pointer shadow-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          classNameTrigger
        )}
      >
        <div className="overflow-auto text-nowrap text-center">{label}</div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          'border rounded shadow-md bg-background text-foreground max-h-[240px] min-w-44 overflow-y-auto bg-background-secondary',
          className
        )}
        ref={dropdownContentRef}
      >
        {/* Select All Checkbox */}
        <DropdownMenuCheckboxItem
          className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 
                ${selectedOptions.length === options.length ? 'bg-inherit text-white' : 'text-gray-700'}`}
          checked={selectedOptions.length === options.length}
          onCheckedChange={handleSelectAll}
        >
          <input
            type="checkbox"
            checked={selectedOptions.length === options.length}
            readOnly
            className="hidden" // Hide the default checkbox
          />
          <span
            className={`w-4 h-4 border-2 rounded-md flex items-center justify-center mr-2 
                     ${selectedOptions.length === options.length ? 'border-blue-600 bg-blue-600' : 'bg-white'}`}
          >
            {selectedOptions.length === options.length && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </span>
          <span className="font-semibold">Select All</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />

        {options.map((option, index) => (
          <Fragment key={option.id}>
            <DropdownMenuCheckboxItem
              className="cursor-pointer"
              checked={selectedOptions.some(
                (selected) => selected.id === option.id
              )}
              onCheckedChange={() => handleChange(option)}
            >
              {option.name}
            </DropdownMenuCheckboxItem>
            {/* Render separator only if it's not the last option */}
            {index < options.length - 1 && <DropdownMenuSeparator />}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
