'use client'

import { DpButton } from '@js-monorepo/button'
import { cn } from '@js-monorepo/ui/util'

export function NotificationReadAllButton({ onReadAll }: { onReadAll?: () => Promise<any> }) {
  return (
    <DpButton
      size="small"
      variant="outline"
      className={cn(
        'h-7 px-3 text-xs font-medium',
        'border-border hover:border-border/80',
        'bg-transparent hover:bg-background-secondary/50',
        'text-foreground-neutral hover:text-foreground',
        'transition-all duration-200'
      )}
      onClick={async () => {
        return onReadAll?.()
      }}
    >
      Mark all read
    </DpButton>
  )
}
