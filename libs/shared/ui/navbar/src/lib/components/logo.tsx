import React, { forwardRef } from 'react'

const DpLogo = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props} className="hover:cursor-pointer">
      {children}
    </div>
  )
})

DpLogo.displayName = 'DpLogo'

export { DpLogo }
