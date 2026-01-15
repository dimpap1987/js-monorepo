'use client'

import { createContext, PropsWithChildren, useContext } from 'react'

export type FeatureFlagsMap = Record<string, boolean>

const FeatureFlagsContext = createContext<FeatureFlagsMap | null>(null)

export function FeatureFlagsProvider({
  flags,
  children,
}: PropsWithChildren<{
  flags: FeatureFlagsMap
}>) {
  return <FeatureFlagsContext.Provider value={flags}>{children}</FeatureFlagsContext.Provider>
}

export function useFeatureFlag(key: string): boolean {
  const flags = useContext(FeatureFlagsContext)
  if (!flags) return false
  return !!flags[key]
}

export function useFeatureFlags(): FeatureFlagsMap {
  return useContext(FeatureFlagsContext) ?? {}
}
