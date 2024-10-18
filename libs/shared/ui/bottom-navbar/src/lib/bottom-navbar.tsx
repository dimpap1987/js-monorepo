'use client'

import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'

export function BottomNavbarComponent({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={cn(
        'sticky top-full bottom-0 bg-zinc-900 border-t border-primary-border rounded-t-xl',
        className
      )}
    >
      <div className="flex gap-8 p-4 justify-around">{children}</div>
    </div>
  )
}
