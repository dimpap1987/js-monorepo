import { DpLoadingSpinner } from '@js-monorepo/loader'
import { cn } from '@js-monorepo/ui/util'
import { HTMLAttributes } from 'react'
import { IoMdInformationCircle } from 'react-icons/io'
import { MdCheckCircle, MdError } from 'react-icons/md'
import styles from './notification.module.css'

export type DpNotificationProps = {
  readonly id?: string
  readonly type?: 'success' | 'error' | 'spinner' | 'information'
  readonly message: string
  readonly description?: string
  readonly duration?: number
  readonly canClose?: boolean
}

export type OnClose = (notificationId: DpNotificationProps['id']) => void

const ICONS = {
  success: <MdCheckCircle className="text-green-600 text-xl" />,
  error: <MdError className="text-red-600 text-xl" />,
  information: <IoMdInformationCircle className="text-xl text-gray-200" />,
}

export function NotificationItem({
  type = 'information',
  message,
  description,
  id,
  canClose = false,
  removeNotification,
  ...rest
}: HTMLAttributes<HTMLDivElement> & DpNotificationProps & { removeNotification?: OnClose }) {
  if (!message) return null

  return (
    <div className={cn('flex relative w-max max-w-[95vw] self-end m-2', styles.notificationContainer)} {...rest}>
      {/* Close Button */}
      {canClose && (
        <button
          onClick={() => id && removeNotification?.(id)}
          className="absolute top-[1px] right-2 text-white/70 hover:text-white p-1 transition"
          aria-label="Close"
        >
          &times;
        </button>
      )}

      <div className="w-full py-1 px-3 text-sm text-white bg-background-secondary grid grid-cols-[max-content_1fr] items-center gap-2">
        {/* Icon */}
        <div className="self-center p-1">
          {type === 'spinner' ? (
            <DpLoadingSpinner styles={{ width: '1.2rem', aspectRatio: 1 }} />
          ) : (
            ICONS[type] // Dynamically selects the correct icon
          )}
        </div>

        {/* Message & Description */}
        <div className="self-center overflow-hidden text-ellipsis text-center">
          <div className="p-0.5 text-sm mr-2">{message}</div>
          {description && <small className="block p-0.5 text-xs">{description}</small>}
        </div>
      </div>
    </div>
  )
}
