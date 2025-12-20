import { DpLoadingSpinner } from '@js-monorepo/loader'
import { cn } from '@js-monorepo/ui/util'
import { HTMLAttributes } from 'react'
import { IoMdInformationCircle } from 'react-icons/io'
import { MdCheckCircle, MdError, MdClose } from 'react-icons/md'
import styles from './notification.module.css'

export type DpNotificationProps = {
  readonly id?: number
  readonly type?: 'success' | 'error' | 'spinner' | 'information'
  readonly message: string
  readonly description?: string
  readonly duration?: number
  readonly closable?: boolean
}

const ICONS = {
  success: <MdCheckCircle className="text-status-success text-xl" />,
  error: <MdError className="text-status-error text-xl" />,
  information: <IoMdInformationCircle className="text-xl text-status-info" />,
}

export interface NotificationItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'>, DpNotificationProps {
  onClose?: (id?: number) => void
}

export function NotificationItem({
  type = 'information',
  message,
  description,
  closable = true,
  id,
  onClose,
  ...rest
}: NotificationItemProps) {
  if (!message) return null

  const { id: divId, ...divProps } = rest as HTMLAttributes<HTMLDivElement>
  return (
    <div
      className={cn('flex relative self-end w-max max-w-96 pointer-events-auto', styles.notificationContainer)}
      {...divProps}
    >
      <div className="w-full py-3 px-5 text-sm bg-card border border-border shadow-lg grid grid-cols-[max-content_1fr_max-content] items-center gap-2">
        {/* Icon */}
        <div className="self-center p-1">
          {type === 'spinner' ? (
            <DpLoadingSpinner styles={{ width: '1.2rem', aspectRatio: 1 }} />
          ) : (
            ICONS[type] // Dynamically selects the correct icon
          )}
        </div>

        {/* Message & Description */}
        <div className="self-center overflow-hidden text-ellipsis">
          <div className="p-0.5 text-sm text-card-foreground">{message}</div>
          {description && <small className="block p-0.5 text-xs text-card-foreground opacity-80">{description}</small>}
        </div>

        {/* Close Button */}
        {closable && onClose && (
          <button
            onClick={() => onClose(id)}
            className="self-center p-1 rounded transition-colors pointer-cursor hover:bg-muted"
            aria-label="Close notification"
          >
            <MdClose className="text-lg text-foreground-muted" />
          </button>
        )}
      </div>
    </div>
  )
}
