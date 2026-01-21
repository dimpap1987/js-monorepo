'use client'

import React, { HTMLAttributes } from 'react'
import { cn } from '@js-monorepo/ui/util'
import { BackButton } from './back-button'
import { useDeviceType } from '@js-monorepo/next/hooks'

interface BackArrowWithLabelProps extends HTMLAttributes<HTMLDivElement> {
  arrowClassName?: string
  alwaysShowArrow?: boolean
  href?: string
}

const BackArrowWithLabel = React.forwardRef<HTMLDivElement, BackArrowWithLabelProps>(
  ({ children, arrowClassName, className, alwaysShowArrow = false, href, ...props }, ref) => {
    const { deviceType } = useDeviceType()
    const isMobile = deviceType === 'mobile'
    const showArrow = alwaysShowArrow || isMobile

    // Extract text alignment from className - check for text-center, default to text-left
    const hasTextCenter = className?.includes('text-center')
    const textAlignClass = hasTextCenter ? 'text-center sm:text-start' : 'text-left'

    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
        {showArrow && <BackButton href={href} className={arrowClassName} />}
        <div className={cn('flex-1', textAlignClass)}>{children}</div>
      </div>
    )
  }
)

BackArrowWithLabel.displayName = 'BackArrowWithLabel'

export { BackArrowWithLabel }
