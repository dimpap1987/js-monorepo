import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export interface DpDialogHeaderProps {
  children: ReactNode
  className?: string
}

function DpDialogHeader({ children, className }: DpDialogHeaderProps) {
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

DpDialogHeader.displayName = 'DpDialogHeader'

export default DpDialogHeader
