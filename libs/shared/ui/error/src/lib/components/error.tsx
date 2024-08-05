import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'

const ErrorComponent = ({
  children,
  type = 'component',
  className,
  errorMessage = 'Oops, an error has occured. Please try again...',
}: PropsWithChildren & {
  errorMessage?: string
  type?: 'global' | 'component'
  className?: string
}) => {
  return type === 'global' ? (
    <div className={cn(`grid place-content-center`, className)}>
      <div className="text-center mb-6">
        <h1>{errorMessage}</h1>
      </div>
      {children}
    </div>
  ) : (
    <h1>Component error occured</h1>
  )
}

export { ErrorComponent }
