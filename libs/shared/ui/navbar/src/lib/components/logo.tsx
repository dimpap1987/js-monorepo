import React, { forwardRef } from 'react'

const NavbarLogo = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props} className="hover:cursor-pointer">
      {children}
    </div>
  )
})

NavbarLogo.displayName = 'NavbarLogo'

export { NavbarLogo }
