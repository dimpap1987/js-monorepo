import { UserNotificationType } from '@js-monorepo/types'
import moment from 'moment'

export function humanatizeNotificationDate(date: string | Date) {
  const momentDate = moment(date)
  if (!momentDate.isValid()) return 'Invalid date'

  const timeDifference = moment().diff(momentDate)
  const formattedDifference = moment.duration(timeDifference).humanize()
  return formattedDifference
}

export const updateNotificationAsRead = (
  notifications: UserNotificationType[],
  notificationId: number
): UserNotificationType[] => {
  return notifications?.map((item) =>
    item.notification?.id === notificationId ? { ...item, isRead: true } : item
  )
}
