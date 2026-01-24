'use client'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@js-monorepo/components/ui/form'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import { TagSelect } from './tag-select'
import { TagEntityType } from './queries'

interface TagSelectFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  /** React Hook Form control */
  control: Control<TFieldValues>
  /** Field name in the form */
  name: TName
  /** Entity type to filter available tags */
  entityType: TagEntityType
  /** Label for the field */
  label?: string
  /** Description text below the field */
  description?: string
  /** Placeholder text when no tags selected */
  placeholder?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Group tags by category in the dropdown */
  groupByCategory?: boolean
  /** Additional class name */
  className?: string
}

/**
 * TagSelect component integrated with react-hook-form
 *
 * @example
 * ```tsx
 * <TagSelectField
 *   control={form.control}
 *   name="tagIds"
 *   entityType="CLASS"
 *   label="Tags"
 *   description="Select tags for this class"
 * />
 * ```
 */
export function TagSelectField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  entityType,
  label,
  description,
  placeholder,
  disabled,
  groupByCategory,
  className,
}: TagSelectFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <TagSelect
              entityType={entityType}
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
              groupByCategory={groupByCategory}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
