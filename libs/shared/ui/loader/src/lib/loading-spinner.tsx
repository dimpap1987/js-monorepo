import { cn } from '@js-monorepo/ui/util'
import { CSSProperties } from 'react'
import './loader.module.css'

export type DpLoadingProps = {
  readonly message?: string
  readonly styles?: CSSProperties
  readonly className?: string
}
const spinnerLoader = {
  height: '1.7rem',
  width: '1.7rem',
  animation: 'spin 1s linear infinite',
  stroke: 'white',
}

export function DpLoadingSpinner({
  message,
  styles,
  className,
}: DpLoadingProps) {
  return (
    <div
      aria-label="Loading..."
      role="status"
      className={cn('flex items-center text-sm', className)}
    >
      <svg
        style={{ ...spinnerLoader, ...styles }}
        className="animate-spin h-5 w-5 text-blue-600 inline-block"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-35"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0116 0H4z"
        ></path>
      </svg>
      {message && (
        <div className="leading-4 font-bold ml-2 text-nowrap">{message}</div>
      )}
    </div>
  )
}

export default DpLoadingSpinner
