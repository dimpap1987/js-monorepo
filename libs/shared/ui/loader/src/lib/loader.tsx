import { cn } from '@js-monorepo/ui/util'
import { CSSProperties } from 'react'
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
  show,
  className,
  spinnerStyle,
  overlayClassName,
}: DpLoaderProps) {
  return (
    <div
      className={cn(
        `fixed inset-0 flex items-center justify-center bg-black 
      bg-opacity-90 transform transition-transform
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
