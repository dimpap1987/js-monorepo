export interface ClassViewScheduleDto {
  id: number
  startTimeUtc: Date
  endTimeUtc: Date
  localTimezone: string
  bookingCounts: {
    booked: number
    waitlisted: number
  }
}

export interface ClassViewResponseDto {
  id: number
  title: string
  description: string | null
  capacity: number | null
  isPrivate: boolean
  location: {
    id: number
    name: string
    timezone: string
    isOnline: boolean
  }
  organizer: {
    id: number
    displayName: string | null
    slug: string | null
    activityLabel: string | null
  }
  schedules: ClassViewScheduleDto[]
}
