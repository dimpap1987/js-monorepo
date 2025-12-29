'use client'

interface NotificationEmptyStateProps {
  title?: string
  message?: string
}

export function NotificationEmptyState({
  title = 'No notifications yet',
  message = "You're all caught up!",
}: NotificationEmptyStateProps) {
  return (
    <div className="flex flex-col justify-center items-center py-12 px-8 text-center">
      <p className="text-base font-semibold text-foreground mb-1">{title}</p>
      <p className="text-sm text-foreground-muted">{message}</p>
    </div>
  )
}
