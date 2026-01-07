import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'

export function BodyTemplate({ children, className }: PropsWithChildren & { className?: string }) {
  return <body className={cn('flex flex-col min-w-[200px]', className)}>{children}</body>
}
