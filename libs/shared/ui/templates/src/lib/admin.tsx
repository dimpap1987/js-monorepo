import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'

export function AdminTemplateSideBar({
  children,
  className,
}: PropsWithChildren & {
  className?: string
}) {
  return (
    <div
      className={cn(
        'fixed top-[calc(20px_+_var(--navbar-height))] left-0 bottom-0',
        'hidden min-w-max sm:flex flex-col justify-between p-2 border-r border-border rounded-md',
        className
      )}
    >
      {children}
    </div>
  )
}

export function AdminTemplateContent({
  children,
  className,
}: PropsWithChildren & {
  className?: string
}) {
  return (
    <div
      className={cn(
        'absolute p-3 left-0 sm:left-[180px] right-0 overflow-y-hidden max-w-6xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}
