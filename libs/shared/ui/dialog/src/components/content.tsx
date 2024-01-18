import { ReactNode } from 'react'

export interface DpDialogContentProps {
  children?: ReactNode
  className?: string
}

function DpDialogContent({ children, className }: DpDialogContentProps) {
  return children && <div className={className}>{children}</div>
}

DpDialogContent.displayName = 'DpDialogContent'

export default DpDialogContent
