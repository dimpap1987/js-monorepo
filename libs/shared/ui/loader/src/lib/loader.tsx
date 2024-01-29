import { twMerge } from 'tailwind-merge'
import DpLoadingSpinner from './loading-spinner'
import { CSSProperties } from 'react'

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
      className={twMerge(
        `fixed left-0 w-screen h-screen
      flex items-center justify-center bg-black 
      bg-opacity-70 transform transition-transform
      duration-200 ${show ? 'scale-100' : 'scale-0'} z-50 select-none`,
        overlayClassName
      )}
    >
      <div
        className={twMerge(
          `text-white mt-[100px] flex flex-col items-center justify-center transform -translate-y-20 
          p-[240px] bg-[radial-gradient(rgba(0,0,0,0.90)_0%,rgba(255,255,255,0.00)_25%)]`,
          className
        )}
      >
        <DpLoadingSpinner
          message={message}
          styles={spinnerStyle}
        ></DpLoadingSpinner>
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
