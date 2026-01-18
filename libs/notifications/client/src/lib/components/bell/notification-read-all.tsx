'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { cn } from '@js-monorepo/ui/util'

interface NotificationReadAllButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  onReadAll?: () => Promise<any>
}

export function NotificationReadAllButton({ onReadAll, ...props }: NotificationReadAllButtonProps) {
  return (
    <Button
      {...props}
      size="sm"
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
    </Button>
  )
}
