import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    children && (
      <div
        className={twMerge(
          'flex shrink-0 items-center p-3 text-xl font-semibold font-heading space-x-12 leading-snug text-blue-gray-900 antialiased',
          className
        )}
      >
        {children}
      </div>
    )
  )
}

DialogHeader.displayName = 'DialogHeader'

export default DialogHeader
