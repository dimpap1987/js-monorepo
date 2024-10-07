'use client'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown'
import { Fragment, useEffect, useState } from 'react'

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
}

export function MultiSelectDropdown({
  options,
  onChange,
  prompt,
  selectedIds = [],
}: MultiSelectDropdownProps) {
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([])
  const [label, setLabel] = useState<string | undefined>(prompt)

  function constructLabel(newOptions: OptionType[]) {
    const localLabel = options
      .filter((opt) => newOptions.some((s) => s.id === opt.id))
      .map((opt) => opt.name)
      .join(', ')

    return localLabel ? localLabel : 'Select...'
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

    setSelectedOptions(newSelectedOptions)
    setLabel(constructLabel(newSelectedOptions))
    onChange(newSelectedOptions)
  }

  return (
    <label className="block w-full">
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="w-full border-2 border-border rounded-lg text-foreground
         px-6 py-1 text-base hover:border-primary cursor-pointer shadow-sm transition-colors
         focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-background-primary text-foreground"
        >
          <div className="overflow-auto text-nowrap text-center">{label}</div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="border rounded shadow-md bg-background-primary text-foreground">
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
    </label>
  )
}
