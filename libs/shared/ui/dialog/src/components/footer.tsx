import { ReactNode } from 'react'

export interface DialogFooterProps {
  children: ReactNode
}

function DialogFooter({ children }: DialogFooterProps) {
  return children && children
}

DialogFooter.displayName = 'DialogFooter'

export default DialogFooter
