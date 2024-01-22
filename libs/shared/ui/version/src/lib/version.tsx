import pkg from '@js-monorepo/package.json'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

export interface DpVersionProps {
  readonly className?: string
}

const DpVersion = forwardRef<HTMLSpanElement, DpVersionProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={twMerge(
          'p-1 rounded-md text-gray-700 font-light text-sm text-white',
          className
        )}
        {...props}
      >
        Version: <span className="font-medium">"{pkg.version}"</span>
      </span>
    )
  }
)

DpVersion.displayName = 'DpVersion'

export { DpVersion }
