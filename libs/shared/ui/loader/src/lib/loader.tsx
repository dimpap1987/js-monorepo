'use client'

import { cn } from '@js-monorepo/ui/util'
import { CSSProperties, useEffect } from 'react'
import DpLoadingSpinner from './loading-spinner'

export interface DpLoaderProps {
  readonly message?: string
  readonly description?: string
  readonly show?: boolean
  readonly className?: string
  readonly spinnerStyle?: CSSProperties
  readonly overlayClassName?: string
}

export function DpLoader({
  message = 'Loading...',
  description,
  show = true,
  className,
  spinnerStyle,
  overlayClassName,
}: DpLoaderProps) {
  useEffect(() => {
    if (show) {
      // Prevent scrolling
      document.body.style.overflow = 'hidden'
    } else {
      // Re-enable scrolling
      document.body.style.overflow = ''
    }
    // Cleanup on unmount just in case
    return () => {
      document.body.style.overflow = ''
    }
  }, [show])

  return (
    <div
      className={cn(
        `fixed inset-0 flex items-center justify-center bg-black 
      bg-opacity-80 transform transition-transform
      duration-200 ${show ? 'scale-100' : 'scale-0'} z-40 select-none`,
        overlayClassName
      )}
    >
      <div
        className={cn(
          `text-white mt-[100px] flex flex-col items-center justify-center transform -translate-y-20 p-[240px]`,
          className
        )}
      >
        <DpLoadingSpinner message={message} styles={spinnerStyle}></DpLoadingSpinner>
        {description && (
          <p>
            <small>{description}</small>
          </p>
        )}
      </div>
    </div>
  )
}

export default DpLoader
