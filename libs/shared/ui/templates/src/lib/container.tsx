import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'

export function ContainerTemplate({ children, className }: PropsWithChildren & { className?: string }) {
  return <section className={cn('max-w-[1600px] mx-auto px-2 sm:px-5', className)}>{children}</section>
}
