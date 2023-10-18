import { ReactNode } from 'react'

export interface DialogContentProps {
  children?: ReactNode
  className?: string
}

function DialogContent({ children, className }: DialogContentProps) {
  return children && <div className={className}>{children}</div>
}

DialogContent.displayName = 'DialogContent'

export default DialogContent
