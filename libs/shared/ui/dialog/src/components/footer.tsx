import { PropsWithChildren, forwardRef, ForwardedRef } from 'react'

interface DpDialogFooterProps extends PropsWithChildren {}

const DpDialogFooter = forwardRef(
  ({ children }: DpDialogFooterProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div ref={ref} className="flex justify-end p-1">
        {children}
      </div>
    )
  }
)

DpDialogFooter.displayName = 'DpDialogFooter'

export default DpDialogFooter
