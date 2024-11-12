import moment from 'moment'

export function humanatizeNotificationDate(date: string | Date) {
  const momentDate = moment(date)
  if (!momentDate.isValid()) return 'Invalid date'

  const timeDifference = moment().diff(momentDate)
  const formattedDifference = moment.duration(timeDifference).humanize()
  return formattedDifference
}
