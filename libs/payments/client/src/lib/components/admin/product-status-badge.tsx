'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { cn } from '@js-monorepo/ui/util'
import { CheckCircle, Cloud, CloudOff, XCircle } from 'lucide-react'

interface ActiveStatusBadgeProps {
  active: boolean
  className?: string
}

export function ActiveStatusBadge({ active, className }: ActiveStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1',
        active
          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
          : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
        className
      )}
    >
      {active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {active ? 'Active' : 'Inactive'}
    </Badge>
  )
}

interface StripeSyncBadgeProps {
  stripeId: string
  className?: string
}

export function StripeSyncBadge({ stripeId, className }: StripeSyncBadgeProps) {
  const isSynced = !stripeId.startsWith('local_')

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1',
        isSynced
          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        className
      )}
    >
      {isSynced ? <Cloud className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />}
      {isSynced ? 'Synced' : 'Local Only'}
    </Badge>
  )
}

interface FeatureCountBadgeProps {
  count: number
  className?: string
}

export function FeatureCountBadge({ count, className }: FeatureCountBadgeProps) {
  return (
    <Badge variant="secondary" className={cn('text-xs', className)}>
      {count} {count === 1 ? 'feature' : 'features'}
    </Badge>
  )
}

interface PriceCountBadgeProps {
  count: number
  className?: string
}

export function PriceCountBadge({ count, className }: PriceCountBadgeProps) {
  return (
    <Badge variant="secondary" className={cn('text-xs', className)}>
      {count} {count === 1 ? 'price' : 'prices'}
    </Badge>
  )
}

interface HierarchyBadgeProps {
  hierarchy: number
  className?: string
}

export function HierarchyBadge({ hierarchy, className }: HierarchyBadgeProps) {
  const tierNames: Record<number, string> = {
    0: 'Free',
    1: 'Basic',
    2: 'Pro',
    3: 'Premium',
    4: 'Enterprise',
  }

  const tierName = tierNames[hierarchy] || `Tier ${hierarchy}`

  return (
    <Badge variant="outline" className={cn('text-xs', className)}>
      {tierName}
    </Badge>
  )
}
