import { PropsWithChildren, forwardRef, ForwardedRef } from 'react'

type DpDialogFooterProps = PropsWithChildren

const DpDialogFooter = forwardRef(
  ({ children }: DpDialogFooterProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div ref={ref} className="flex justify-center p-1">
        {children}
      </div>
    )
  }
)

DpDialogFooter.displayName = 'DpDialogFooter'

export default DpDialogFooter
