'use client'

import { cn } from '@js-monorepo/ui/util'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { FeatureBadge, type FeatureBadgeProps } from './feature-badge'

const comingSoonWrapperVariants = cva('relative', {
  variants: {
    opacity: {
      low: '[&>*:not(.coming-soon-overlay)]:opacity-30',
      medium: '[&>*:not(.coming-soon-overlay)]:opacity-50',
      high: '[&>*:not(.coming-soon-overlay)]:opacity-70',
    },
    blur: {
      none: '',
      sm: '[&>*:not(.coming-soon-overlay)]:blur-[1px]',
      md: '[&>*:not(.coming-soon-overlay)]:blur-[2px]',
      lg: '[&>*:not(.coming-soon-overlay)]:blur-[4px]',
    },
    badgePosition: {
      'top-left': '',
      'top-center': '',
      'top-right': '',
      center: '',
      'bottom-left': '',
      'bottom-center': '',
      'bottom-right': '',
    },
  },
  defaultVariants: {
    opacity: 'medium',
    blur: 'none',
    badgePosition: 'top-right',
  },
})

const badgePositionStyles: Record<string, string> = {
  'top-left': 'top-2 left-2',
  'top-center': 'top-2 left-1/2 -translate-x-1/2',
  'top-right': 'top-2 right-2',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-center': 'bottom-2 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-2 right-2',
}

export interface ComingSoonWrapperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof comingSoonWrapperVariants> {
  disabled?: boolean
  showBadge?: boolean
  badgeVariant?: FeatureBadgeProps['variant']
  badgeLabel?: string
  badgeSize?: FeatureBadgeProps['size']
}

function ComingSoonWrapper({
  className,
  children,
  opacity,
  blur,
  badgePosition = 'top-right',
  disabled = true,
  showBadge = true,
  badgeVariant = 'soon',
  badgeLabel,
  badgeSize,
  ...props
}: ComingSoonWrapperProps) {
  return (
    <div
      className={cn(
        comingSoonWrapperVariants({ opacity, blur, badgePosition }),
        disabled && 'pointer-events-none select-none',
        className
      )}
      aria-disabled={disabled}
      {...props}
    >
      {children}
      {showBadge && (
        <div className={cn('coming-soon-overlay absolute z-10', badgePositionStyles[badgePosition ?? 'top-right'])}>
          <FeatureBadge variant={badgeVariant} size={badgeSize} label={badgeLabel} />
        </div>
      )}
    </div>
  )
}

export { ComingSoonWrapper, comingSoonWrapperVariants }
