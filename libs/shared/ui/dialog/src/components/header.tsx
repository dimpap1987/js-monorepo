import { cn } from '@js-monorepo/utils'
import { ForwardedRef, ReactNode, forwardRef } from 'react'

interface DpDialogHeaderProps {
  children: ReactNode
  className?: string
}

const DpDialogHeader = forwardRef(
  (
    { children, className }: DpDialogHeaderProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      children && (
        <div
          ref={ref}
          className={cn(
            'flex shrink-0 items-center p-3 text-xl font-semibold font-heading leading-snug text-black antialiased',
            className
          )}
        >
          {children}
        </div>
      )
    )
  }
)

DpDialogHeader.displayName = 'DpDialogHeader'

export default DpDialogHeader
