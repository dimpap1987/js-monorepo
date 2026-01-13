'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { cn } from '@js-monorepo/ui/util'
import { AlertTriangle, CheckCircle, Cloud, CloudOff, Link2Off, RefreshCw, XCircle } from 'lucide-react'
import { SyncStatus } from '../../types'

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

// ============= Verified Sync Status (moved before StripeSyncBadge) =============

interface VerifiedSyncStatusBadgeProps {
  status: SyncStatus
  className?: string
}

const syncStatusConfig: Record<SyncStatus, { label: string; icon: React.ElementType; className: string }> = {
  [SyncStatus.SYNCED]: {
    label: 'Synced',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  [SyncStatus.LOCAL_ONLY]: {
    label: 'Local Only',
    icon: CloudOff,
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  [SyncStatus.STRIPE_ONLY]: {
    label: 'Stripe Only',
    icon: Cloud,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  [SyncStatus.DRIFT]: {
    label: 'Out of Sync',
    icon: AlertTriangle,
    className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  [SyncStatus.ORPHANED]: {
    label: 'Orphaned',
    icon: Link2Off,
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
  [SyncStatus.UNVERIFIED]: {
    label: 'Unverified',
    icon: RefreshCw,
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  },
}

export function VerifiedSyncStatusBadge({ status, className }: VerifiedSyncStatusBadgeProps) {
  const config = syncStatusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('gap-1', config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// ============= Stripe Sync Badge =============

interface StripeSyncBadgeProps {
  verifiedStatus?: SyncStatus
  isVerifying?: boolean
  className?: string
}

export function StripeSyncBadge({ verifiedStatus, isVerifying, className }: StripeSyncBadgeProps) {
  // If we have a verified status, use that instead of the prefix check
  if (isVerifying) {
    return (
      <Badge
        variant="outline"
        className={cn('gap-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20', className)}
      >
        <RefreshCw className="h-3 w-3 animate-spin" />
        Verifying...
      </Badge>
    )
  }

  // If a verified status is provided, use it
  if (verifiedStatus) {
    return <VerifiedSyncStatusBadge status={verifiedStatus} className={className} />
  }

  // If no verified status and not verifying, default to UNVERIFIED
  return <VerifiedSyncStatusBadge status={SyncStatus.UNVERIFIED} className={className} />
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

// ============= Price Status Badge =============

interface PriceStatusBadgeProps {
  status: 'active' | 'legacy' | 'deprecated' | 'archived'
  className?: string
}

const priceStatusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  legacy: {
    label: 'Legacy',
    icon: Cloud,
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  deprecated: {
    label: 'Deprecated',
    icon: AlertTriangle,
    className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  archived: {
    label: 'Archived',
    icon: XCircle,
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  },
}

export function PriceStatusBadge({ status, className }: PriceStatusBadgeProps) {
  const config = priceStatusConfig[status] || priceStatusConfig.active
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('gap-1', config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
