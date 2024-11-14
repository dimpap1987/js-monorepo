'use client'

import { cn } from '@js-monorepo/ui/util'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown'

type OptionType = {
  id: number
  name: string
}

interface MultiSelectDropdownProps {
  formFieldName?: string
  options: OptionType[] // Array of OptionType
  onChange: (selectedOptions: OptionType[]) => void // Callback function for selected options
  prompt?: string
  selectedIds?: (number | string)[] // New property for selected IDs
  className?: string
}

export function MultiSelectDropdown({
  options,
  onChange,
  prompt,
  selectedIds = [],
  className,
}: MultiSelectDropdownProps) {
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([])
  const [label, setLabel] = useState<string | undefined>(prompt)
  const [isOpen, setIsOpen] = useState(false) // State to control dropdown visibility

  const dropdownContentRef = useRef<HTMLDivElement | null>(null)
  const dropdownTriggerRef = useRef<HTMLButtonElement | null>(null)

  useClickAway(dropdownContentRef, (event) => {
    if (dropdownTriggerRef.current?.contains(event.target as Node)) {
      return
    }
    setIsOpen(false)
  })

  function constructLabel(newOptions: OptionType[]) {
    const localLabel = options
      .filter((opt) => newOptions.some((s) => s.id === opt.id))
      .map((opt) => opt.name)
      .join(', ')

    return localLabel ? localLabel : 'Select ...'
  }

  useEffect(() => {
    // Initialize selectedOptions based on selectedIds prop
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
      ? selectedOptions.filter((selected) => selected.id !== option.id) // Deselect option
      : [...selectedOptions, option] // Select option

    if (
      newSelectedOptions === null ||
      newSelectedOptions === undefined ||
      newSelectedOptions.length === 0
    ) {
      setLabel(prompt)
    } else {
      setLabel(constructLabel(newSelectedOptions))
    }
    setSelectedOptions(newSelectedOptions)
    onChange(newSelectedOptions)
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
        className="w-full border-2 border-border rounded-lg text-foreground hide-scrollbar
         px-6 py-1 text-base hover:border-border/80 cursor-pointer shadow-sm transition-colors
         focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-background"
      >
        <div className="overflow-auto text-nowrap text-center">{label}</div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          'border rounded shadow-md bg-background text-foreground max-h-[235px] overflow-y-auto',
          className
        )}
        ref={dropdownContentRef}
      >
        {options.map((option, index) => (
          <Fragment key={option.id}>
            <DropdownMenuCheckboxItem
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
