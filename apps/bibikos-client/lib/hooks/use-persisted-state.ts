'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UsePersistedStateOptions<T> {
  /** Storage key */
  key: string
  /** Storage to use (default: localStorage) */
  storage?: Storage
  /** Serialize function (default: JSON.stringify) */
  serialize?: (value: T) => string
  /** Deserialize function (default: JSON.parse) */
  deserialize?: (value: string) => T
}

/**
 * useState that persists to localStorage
 *
 * Handles SSR/hydration correctly by only reading from localStorage after mount.
 *
 * @example
 * ```tsx
 * const [step, setStep, clearStep] = usePersistedState(1, { key: 'onboarding-step' })
 * const [formData, setFormData, clearFormData] = usePersistedState<FormData | null>(null, {
 *   key: 'onboarding-profile-data'
 * })
 * ```
 */
export function usePersistedState<T>(
  defaultValue: T,
  options: UsePersistedStateOptions<T>
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { key, storage, serialize = JSON.stringify, deserialize = JSON.parse } = options

  // Get storage (handle SSR)
  const getStorage = useCallback((): Storage | null => {
    if (typeof window === 'undefined') return null
    return storage || window.localStorage
  }, [storage])

  // Track if we've hydrated from localStorage
  const isHydratedRef = useRef(false)

  // Always initialize with default value to match server render
  const [state, setStateInternal] = useState<T>(defaultValue)

  // Hydrate from localStorage after mount (client-side only)
  useEffect(() => {
    if (isHydratedRef.current) return
    isHydratedRef.current = true

    const store = getStorage()
    if (!store) return

    try {
      const stored = store.getItem(key)
      if (stored !== null) {
        const parsed = deserialize(stored)
        setStateInternal(parsed)
      }
    } catch (error) {
      console.warn(`[usePersistedState] Failed to read from storage for key "${key}":`, error)
    }
  }, [key, deserialize, getStorage])

  // Sync to storage on change (skip during initial hydration)
  const isFirstRenderRef = useRef(true)
  useEffect(() => {
    // Skip the first render to avoid overwriting localStorage during hydration
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    const store = getStorage()
    if (!store) return

    try {
      // Don't store null/undefined values - remove the key instead
      if (state === null || state === undefined) {
        store.removeItem(key)
      } else {
        store.setItem(key, serialize(state))
      }
    } catch (error) {
      console.warn(`[usePersistedState] Failed to persist state for key "${key}":`, error)
    }
  }, [state, key, serialize, getStorage])

  // Set state wrapper
  const setState = useCallback((value: T | ((prev: T) => T)) => {
    setStateInternal((prev) => {
      const nextValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
      return nextValue
    })
  }, [])

  // Clear function
  const clear = useCallback(() => {
    const store = getStorage()
    if (store) {
      store.removeItem(key)
    }
    setStateInternal(defaultValue)
  }, [key, defaultValue, getStorage])

  return [state, setState, clear]
}

/**
 * Clears multiple persisted state keys at once
 *
 * @example
 * ```tsx
 * clearPersistedStates([
 *   'onboarding-step',
 *   'onboarding-profile-data',
 *   'onboarding-location-data'
 * ])
 * ```
 */
export function clearPersistedStates(keys: string[], storage?: Storage) {
  if (typeof window === 'undefined') return

  const store = storage || window.localStorage
  keys.forEach((key) => {
    store.removeItem(key)
  })
}
