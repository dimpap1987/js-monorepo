'use client'

import { cn } from '@js-monorepo/ui/util'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const featureBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        soon: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        hot: 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30',
        new: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        beta: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30',
        premium:
          'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        deprecated: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[9px]',
        default: 'px-2 py-0.5 text-[10px]',
        lg: 'px-2.5 py-1 text-xs',
      },
      animated: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'hot',
        animated: true,
        className: 'animate-pulse',
      },
      {
        variant: 'new',
        animated: true,
        className: 'animate-pulse',
      },
    ],
    defaultVariants: {
      variant: 'soon',
      size: 'default',
      animated: false,
    },
  }
)

const defaultLabels: Record<string, string> = {
  soon: 'Soon',
  hot: 'Hot',
  new: 'New',
  beta: 'Beta',
  premium: 'Premium',
  deprecated: 'Deprecated',
}

export interface FeatureBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof featureBadgeVariants> {
  label?: string
}

function FeatureBadge({ className, variant = 'soon', size, animated, label, children, ...props }: FeatureBadgeProps) {
  const displayLabel = label ?? children ?? defaultLabels[variant ?? 'soon']

  return (
    <span className={cn(featureBadgeVariants({ variant, size, animated }), className)} {...props}>
      {displayLabel}
    </span>
  )
}

export { FeatureBadge, featureBadgeVariants }
