import { ReactNode, forwardRef } from 'react'

export interface DpDialogContentProps {
  children?: ReactNode
  className?: string
}

const DpDialogContent = forwardRef<HTMLDivElement, DpDialogContentProps>(
  ({ children, className }, ref) => {
    return children ? (
      <div ref={ref} className={className}>
        {children}
      </div>
    ) : null
  }
)
DpDialogContent.displayName = 'DpDialogContent'

export default DpDialogContent
