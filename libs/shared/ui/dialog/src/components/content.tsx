import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export interface DialogContentProps {
  children: ReactNode
  className?: string
}

function DialogContent({ children, className }: DialogContentProps) {
  return (
    children && (
      <div
        className={twMerge(
          'relative border-t border-b border-t-blue-gray-100 border-b-blue-gray-100 p-4 font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased',
          className
        )}
      >
        {children}
      </div>
    )
  )
}

DialogContent.displayName = 'DialogContent'

export default DialogContent
