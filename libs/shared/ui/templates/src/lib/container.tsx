import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'

export function ContainerTemplate({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <section
      className={cn('container max-w-6xl mx-auto overflow-x-hidden', className)}
    >
      {children}
    </section>
  )
}
