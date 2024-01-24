import { twMerge } from 'tailwind-merge'
import DpLoadingSpinner from './loading-spinner'
import { CSSProperties } from 'react'

export interface DpLoaderProps {
  readonly message?: string
  readonly show?: boolean
  readonly className?: string
  readonly spinnerStyle?: CSSProperties
  readonly overlayClassName?: string
}

export function DpLoader({
  message,
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
      bg-opacity-80 transform transition-transform
      duration-200 ${show ? 'scale-100' : 'scale-0'} z-50 select-none`,
        overlayClassName
      )}
    >
      <div
        className={twMerge(
          `text-white mt-[100px] flex flex-col items-center justify-center transform -translate-y-20`,
          className
        )}
      >
        <DpLoadingSpinner
          message="Loading..."
          styles={spinnerStyle}
        ></DpLoadingSpinner>
        {message && (
          <p>
            <small>{message}</small>
          </p>
        )}
      </div>
    </div>
  )
}

export default DpLoader
