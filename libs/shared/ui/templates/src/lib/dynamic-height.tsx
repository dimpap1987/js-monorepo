import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'

export function DynamicHeightTemplate({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <section
      className={cn(
        'space-y-2 sm:max-w-[1400px] mx-auto overflow-y-auto overflow-x-hidden',
        'h-[calc(100svh_-_var(--navbar-height)_-_30px_-_var(--bottom-navbar-height))]',
        'sm:h-[calc(100svh_-_var(--navbar-height)_-_30px_-_20px)] ',
        className
      )}
    >
      {children}
    </section>
  )
}
