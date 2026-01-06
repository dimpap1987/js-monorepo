'use client'

import React, { HTMLAttributes } from 'react'
import { cn } from '@js-monorepo/ui/util'
import { BackArrow } from './back-arrow'
import { useDeviceType } from '@js-monorepo/next/hooks'

interface BackArrowWithLabelProps extends HTMLAttributes<HTMLDivElement> {
  arrowClassName?: string
}

const BackArrowWithLabel = React.forwardRef<HTMLDivElement, BackArrowWithLabelProps>(
  ({ children, arrowClassName, className, ...props }, ref) => {
    const { deviceType } = useDeviceType()
    const isMobile = deviceType === 'mobile'

    return (
      <div ref={ref} className={cn('group flex items-start gap-2', className)} {...props}>
        {isMobile && (
          <BackArrow className={cn('mt-1 shrink-0 transition-transform group-hover:-translate-x-1', arrowClassName)} />
        )}
        <div className="flex-1 text-end">{children}</div>
      </div>
    )
  }
)

BackArrowWithLabel.displayName = 'BackArrowWithLabel'

export { BackArrowWithLabel }
