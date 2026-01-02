'use client'

import { cn } from '@js-monorepo/ui/util'

export interface UsageBarProps {
  /** Current value (e.g., days used, items consumed) */
  current: number
  /** Maximum value (e.g., total trial days, quota limit) */
  max: number
  /** Label to show (e.g., "days left", "credits remaining") */
  label?: string
  /** Whether to show the numeric value */
  showValue?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant based on remaining percentage */
  variant?: 'default' | 'warning' | 'auto'
  /** Additional className */
  className?: string
}

export function UsageBar({
  current,
  max,
  label,
  showValue = true,
  size = 'md',
  variant = 'auto',
  className,
}: UsageBarProps) {
  const remaining = Math.max(0, max - current)
  const percentage = max > 0 ? Math.min(100, (remaining / max) * 100) : 0

  // Determine color based on remaining percentage
  const getBarColor = () => {
    if (variant === 'warning') return 'bg-status-warning'
    if (variant === 'default') return 'bg-primary'

    // Auto: change color based on remaining percentage
    if (percentage <= 20) return 'bg-status-error'
    if (percentage <= 40) return 'bg-status-warning'
    return 'bg-primary'
  }

  const getTextColor = () => {
    if (variant === 'warning') return 'text-status-warning'
    if (variant === 'default') return 'text-foreground-neutral'

    if (percentage <= 20) return 'text-status-error'
    if (percentage <= 40) return 'text-status-warning'
    return 'text-foreground-neutral'
  }

  const sizeStyles = {
    sm: { bar: 'h-1', text: 'text-xs' },
    md: { bar: 'h-1.5', text: 'text-sm' },
    lg: { bar: 'h-2', text: 'text-sm' },
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Label and value */}
      {(showValue || label) && (
        <div className={cn('flex items-center justify-between mb-1.5', sizeStyles[size].text)}>
          {label && <span className="text-foreground-neutral">{label}</span>}
          {showValue && (
            <span className={cn('font-medium tabular-nums', getTextColor())}>
              {remaining} / {max}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className={cn('w-full rounded-full bg-muted overflow-hidden', sizeStyles[size].bar)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', getBarColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
