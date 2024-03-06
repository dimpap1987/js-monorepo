import { ReactNode, forwardRef, ForwardedRef } from 'react'
import { twMerge } from 'tailwind-merge'

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
          className={twMerge(
            'flex shrink-0 items-center p-3 text-xl font-semibold font-heading leading-snug text-blue-gray-900 antialiased',
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
