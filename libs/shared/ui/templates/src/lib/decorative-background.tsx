import { cn } from '@js-monorepo/ui/util'
import React, { PropsWithChildren } from 'react'

interface DecorativeBackgroundProps extends PropsWithChildren {
  className?: string
  blurSizes?: [string, string] // optional, default to current blur
  colors?: [string, string] // optional, override primary colors
  patternOpacity?: number // optional, default 0.05
  circleOpacity?: number // optional, default 0.1
}

export const DecorativeBackground: React.FC<DecorativeBackgroundProps> = ({
  className = '',
  blurSizes = ['blur-3xl', 'blur-2xl'],
  colors = ['bg-primary', 'bg-primary'],
  patternOpacity = 0.05,
  circleOpacity = 0.1,
  children,
}) => {
  return (
    <div className={cn('relative bg-gradient-to-br from-background via-secondary to-background', className)}>
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern" style={{ opacity: patternOpacity }} />

      {/* Top-right circle */}
      <div
        className={`absolute top-0 right-0 w-64 h-64 rounded-full ${colors[0]} ${blurSizes[0]} -translate-y-1/2 translate-x-1/2`}
        style={{ opacity: circleOpacity }}
      />

      {/* Bottom-left circle */}
      <div
        className={`absolute bottom-0 left-0 w-48 h-48 rounded-full ${colors[1]} ${blurSizes[1]} translate-y-1/2 -translate-x-1/2`}
        style={{ opacity: circleOpacity }}
      />
      {children}
    </div>
  )
}
