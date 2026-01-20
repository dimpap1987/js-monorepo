import { Booking, ClassSchedule } from '../../../../lib/scheduling'

export interface DateRange {
  start: string
  end: string
}

export interface BookingDetailDialogProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onUpdateNotes: (id: number, notes: string) => Promise<void>
  onCancel: (id: number, reason?: string) => Promise<void>
}

export interface BookingCardProps {
  booking: Booking
  onViewDetails: () => void
  onToggleAttendance?: (bookingId: number, attended: boolean) => void
  isMarkingAttendance?: boolean
}

export interface ScheduleSelectorProps {
  schedules: ClassSchedule[]
  classes: Array<{ id: number; title: string }>
  selectedScheduleId: number | null
  selectedClassId: string
  dateRange: DateRange
  onScheduleSelect: (scheduleId: number) => void
  onClassFilterChange: (classId: string) => void
  onDateRangeChange: (dateRange: DateRange) => void
}

export interface BookingFiltersProps {
  searchQuery: string
  statusFilter: string
  onSearchChange: (query: string) => void
  onStatusFilterChange: (status: string) => void
}

export interface BookingsListProps {
  bookings: Booking[]
  isLoading: boolean
  searchQuery: string
  statusFilter: string
  onViewDetails: (booking: Booking) => void
  onToggleAttendance?: (bookingId: number, attended: boolean) => void
  isMarkingAttendance?: boolean
  onSearchChange: (query: string) => void
  onStatusFilterChange: (status: string) => void
}

export interface BookingStatsProps {
  total: number
  booked: number
  waitlisted: number
}
