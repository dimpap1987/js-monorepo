'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Input } from '@js-monorepo/components/ui/form'
import { cn } from '@js-monorepo/ui/util'
import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface FeatureEntry {
  key: string
  value: string
}

interface FeaturesEditorProps {
  value: Record<string, string> | null | undefined
  onChange: (features: Record<string, string>) => void
  className?: string
  disabled?: boolean
}

export function FeaturesEditor({ value, onChange, className, disabled }: FeaturesEditorProps) {
  const [entries, setEntries] = useState<FeatureEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  // Initialize entries from value
  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      setEntries(Object.entries(value).map(([key, val]) => ({ key, value: val })))
    } else if (entries.length === 0) {
      setEntries([{ key: '', value: '' }])
    }
  }, [])

  const updateParent = useCallback(
    (newEntries: FeatureEntry[]) => {
      // Filter out empty entries and convert to object
      const validEntries = newEntries.filter((e) => e.key.trim() !== '')
      const features: Record<string, string> = {}

      // Check for duplicate keys
      const keys = validEntries.map((e) => e.key.trim().toLowerCase())
      const hasDuplicates = keys.length !== new Set(keys).size

      if (hasDuplicates) {
        setError('Duplicate keys are not allowed')
        return
      }

      setError(null)
      validEntries.forEach((e) => {
        features[e.key.trim()] = e.value
      })

      onChange(features)
    },
    [onChange]
  )

  const handleKeyChange = (index: number, newKey: string) => {
    const newEntries = [...entries]
    newEntries[index].key = newKey
    setEntries(newEntries)
    updateParent(newEntries)
  }

  const handleValueChange = (index: number, newValue: string) => {
    const newEntries = [...entries]
    newEntries[index].value = newValue
    setEntries(newEntries)
    updateParent(newEntries)
  }

  const addEntry = () => {
    const newEntries = [...entries, { key: '', value: '' }]
    setEntries(newEntries)
  }

  const removeEntry = (index: number) => {
    if (entries.length === 1) {
      // Keep at least one empty entry
      setEntries([{ key: '', value: '' }])
      onChange({})
      return
    }
    const newEntries = entries.filter((_, i) => i !== index)
    setEntries(newEntries)
    updateParent(newEntries)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Feature key"
              value={entry.key}
              onChange={(e) => handleKeyChange(index, e.target.value)}
              className="flex-1"
              disabled={disabled}
            />
            <Input
              placeholder="Feature description"
              value={entry.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              className="flex-[2]"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeEntry(index)}
              disabled={disabled}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="button" variant="outline" size="sm" onClick={addEntry} disabled={disabled} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Feature
      </Button>
    </div>
  )
}
