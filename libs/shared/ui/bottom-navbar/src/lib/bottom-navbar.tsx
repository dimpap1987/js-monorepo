'use client'

import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'

export function BottomNavbar({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={cn(
        'fixed bottom-0 w-full dark:bg-zinc-900 border-t border-border dark:text-gray-300 light:text-foreground',
        className
      )}
    >
      <div className="flex gap-2 justify-around">{children}</div>
    </div>
  )
}
