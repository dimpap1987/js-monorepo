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
        'fixed bottom-0 w-full dark:bg-zinc-900 border-t border-border rounded-t-2xl text-foreground',
        className
      )}
    >
      <div className="flex p-3 pb-2 justify-around">{children}</div>
    </div>
  )
}
