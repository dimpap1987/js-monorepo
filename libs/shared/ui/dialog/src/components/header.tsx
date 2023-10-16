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
          'flex shrink-0 items-center p-4 font-sans text-xl font-semibold leading-snug text-blue-gray-900 antialiased',
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
