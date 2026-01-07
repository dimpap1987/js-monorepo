'use client'

import { DpButton } from '@js-monorepo/button'
import { cn } from '@js-monorepo/ui/util'

interface NotificationReadAllButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  onReadAll?: () => Promise<any>
}

export function NotificationReadAllButton({ onReadAll, ...props }: NotificationReadAllButtonProps) {
  return (
    <DpButton
      {...props}
      size="small"
      variant="outline"
      className={cn(
        'h-7 px-3 text-xs font-medium',
        'border-border hover:border-primary',
        'bg-transparent hover:bg-background-secondary',
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
