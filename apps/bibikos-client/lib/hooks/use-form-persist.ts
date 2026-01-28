'use client'

import { useCallback, useEffect, useRef } from 'react'
import { FieldValues, UseFormReturn, UseFormWatch } from 'react-hook-form'

interface UseFormPersistOptions {
  /** Storage key for this form */
  key: string
  /** Debounce delay in ms (default: 500) */
  debounce?: number
  /** Fields to exclude from persistence */
  exclude?: string[]
  /** Storage to use (default: sessionStorage) */
  storage?: Storage
}

/**
 * Persists react-hook-form values to sessionStorage
 *
 * @example
 * ```tsx
 * const form = useForm<FormData>({ defaultValues: {...} })
 *
 * const { clear } = useFormPersist(form, {
 *   key: 'onboarding-profile',
 *   exclude: ['password'],
 * })
 *
 * const onSubmit = async (data) => {
 *   await saveData(data)
 *   clear() // Clear persisted data on success
 * }
 * ```
 */
export function useFormPersist<T extends FieldValues>(form: UseFormReturn<T>, options: UseFormPersistOptions) {
  const { key, debounce = 500, exclude = [], storage } = options
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)

  // Get storage (handle SSR)
  const getStorage = useCallback((): Storage | null => {
    if (typeof window === 'undefined') return null
    return storage || window.sessionStorage
  }, [storage])

  // Restore values from storage on mount
  useEffect(() => {
    if (isInitializedRef.current) return

    const store = getStorage()
    if (!store) return

    try {
      const stored = store.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)

        // Reset form with stored values (merge with defaults)
        const currentValues = form.getValues()
        const mergedValues = { ...currentValues, ...parsed }

        // Remove excluded fields from restored data
        exclude.forEach((field) => {
          if (field in mergedValues) {
            delete mergedValues[field]
          }
        })

        form.reset(mergedValues, { keepDefaultValues: true })
      }
    } catch (error) {
      console.warn(`[useFormPersist] Failed to restore form data for key "${key}":`, error)
    }

    isInitializedRef.current = true
  }, [key, form, exclude, getStorage])

  // Watch for changes and persist with debounce
  useEffect(() => {
    const store = getStorage()
    if (!store) return

    const subscription = form.watch((values) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Debounce the save
      timeoutRef.current = setTimeout(() => {
        try {
          // Create a copy and remove excluded fields
          const toStore = { ...values }
          exclude.forEach((field) => {
            if (field in toStore) {
              delete toStore[field]
            }
          })

          store.setItem(key, JSON.stringify(toStore))
        } catch (error) {
          console.warn(`[useFormPersist] Failed to persist form data for key "${key}":`, error)
        }
      }, debounce)
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [key, form, debounce, exclude, getStorage])

  // Clear persisted data
  const clear = useCallback(() => {
    const store = getStorage()
    if (store) {
      store.removeItem(key)
    }
  }, [key, getStorage])

  return { clear }
}

/**
 * Clears multiple form persistence keys at once
 *
 * @example
 * ```tsx
 * clearFormPersistence(['onboarding-profile', 'onboarding-location', 'onboarding-class'])
 * ```
 */
export function clearFormPersistence(keys: string[], storage?: Storage) {
  if (typeof window === 'undefined') return

  const store = storage || window.sessionStorage
  keys.forEach((key) => {
    store.removeItem(key)
  })
}
