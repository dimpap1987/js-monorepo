import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'

export function BodyTemplate({ children, className }: PropsWithChildren & { className?: string }) {
  return (
    <body
      className={cn(
        'flex flex-col min-h-100svh min-w-[200px]',
        'bg-background text-foreground overflow-x-hidden w-[100vw]',
        className
      )}
    >
      {children}
    </body>
  )
}
