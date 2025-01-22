import { BsCheck2Circle } from 'react-icons/bs'
import { FaRegTimesCircle } from 'react-icons/fa'
import { IoMdInformationCircle } from 'react-icons/io'
import styles from './notification.module.css'
import { DpLoadingSpinner } from '@js-monorepo/loader'
import { cn } from '@js-monorepo/ui/util'

export type DpNotificationProps = {
  readonly id?: number
  readonly type?: 'success' | 'error' | 'spinner' | 'information'
  readonly message: string
  readonly description?: string
  readonly duration?: number
}

export default function DpNotification({ type = 'information', message, description }: DpNotificationProps) {
  return (
    <div className={cn(styles.containerGrid, 'min-w-72 max-w-96')}>
      {/* Type = 'Spinner' */}
      {type === 'spinner' && (
        <div className={`${styles.spinnerGrid} self-center p-1`}>
          <DpLoadingSpinner></DpLoadingSpinner>
        </div>
      )}

      {/* Type = 'Success' */}
      {type === 'success' && (
        <div className={`${styles.spinnerGrid} self-center p-1`}>
          <BsCheck2Circle className="text-green-600 text-2xl" />
        </div>
      )}

      {/* Type = 'Error' */}
      {type === 'error' && (
        <div className={`${styles.spinnerGrid} self-center p-1`}>
          <FaRegTimesCircle className="text-red-600 text-2xl" />
        </div>
      )}

      {/* Type = 'Information' */}
      {type === 'information' && (
        <div className={`${styles.spinnerGrid} self-center p-1`}>
          <IoMdInformationCircle className="text-2xl" />
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`${styles.gridItem1} overflow-hidden text-ellipsis self-center`}>
          <strong className="block p-0.5 text-sm">{message}</strong>
        </div>
      )}

      {/* Description */}
      {description && (
        <div className={`${styles.gridItem2} overflow-hidden text-ellipsis self-center`}>
          <small className="block p-0.5 text-xs">{description}</small>
        </div>
      )}
    </div>
  )
}
