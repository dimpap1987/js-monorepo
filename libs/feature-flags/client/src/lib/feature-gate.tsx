'use client'

import { PropsWithChildren, ReactNode } from 'react'
import { useFeatureFlag } from './feature-flags.context'

export function FeatureGate({
  flag,
  fallback = null,
  children,
}: PropsWithChildren<{
  flag: string
  fallback?: ReactNode
}>) {
  const enabled = useFeatureFlag(flag)
  if (!enabled) return <>{fallback}</>
  return <>{children}</>
}
