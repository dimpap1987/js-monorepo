import pkg from '@js-monorepo/package.json'
import { cn } from '@js-monorepo/ui/util'
import { forwardRef } from 'react'

export interface DpVersionProps {
  readonly className?: string
}

const DpVersion = forwardRef<HTMLSpanElement, DpVersionProps>(({ className, ...props }, ref) => {
  return (
    <span ref={ref} className={cn('p-1 rounded-md font-light text-sm text-foreground', className)} {...props}>
      Version: <span className="font-medium">"{pkg.version}"</span>
    </span>
  )
})

DpVersion.displayName = 'DpVersion'

export { DpVersion }
