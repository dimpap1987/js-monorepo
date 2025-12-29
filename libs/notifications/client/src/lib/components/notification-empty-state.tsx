'use client'

interface NotificationEmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
}

export function NotificationEmptyState({
  title = 'No notifications yet',
  message = "You're all caught up!",
  icon,
}: NotificationEmptyStateProps) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-8 text-center">
      {icon || (
        <span role="img" aria-label="bell notification" className="text-4xl mb-3 block">
          🔔
        </span>
      )}
      <p className="text-lg font-semibold text-foreground mb-1">{title}</p>
      <p className="text-sm text-foreground-muted">{message}</p>
    </div>
  )
}
