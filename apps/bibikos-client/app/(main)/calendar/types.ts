import { ClassSchedule, Class } from '../../../lib/scheduling'

export type CalendarEventClassNames = string[]

export type CapacityStatus = 'normal' | 'near-capacity' | 'full'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  textColor: string
  classNames?: CalendarEventClassNames
  extendedProps: {
    schedule: ClassSchedule
    classInfo?: Class
    bookingCounts?: { booked: number; waitlisted?: number }
    colorName?: string
    capacityStatus?: CapacityStatus
  }
}

export interface ClassLegendItem {
  id: number
  title: string
  colorName: string
  colorBg: string
  isVisible: boolean
}
