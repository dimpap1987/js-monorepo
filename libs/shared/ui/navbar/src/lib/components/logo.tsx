import { ReactNode } from 'react'

function LogoComponent({ children }: { children: ReactNode }) {
  return <>{children}</>
}

LogoComponent.displayName = 'LogoComponent'

export { LogoComponent }
