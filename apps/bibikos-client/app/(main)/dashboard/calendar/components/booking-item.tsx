import { Badge } from '@js-monorepo/components/ui/badge'
import { cn } from '@js-monorepo/ui/util'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Booking, BOOKING_STATUS_COLORS } from '../../../../../lib/scheduling'

interface BookingItemProps {
  booking: Booking
  onMarkAttendance: (ids: number[], status: 'ATTENDED' | 'NO_SHOW') => void
  isPastClass: boolean
  isCancelled: boolean
}

export function BookingItem({ booking, onMarkAttendance, isPastClass, isCancelled }: BookingItemProps) {
  const colors = BOOKING_STATUS_COLORS[booking.status]
  const participant = booking.participant?.appUser

  return (
    <div className={cn('flex items-center justify-between p-3 rounded-lg border', colors.bg, colors.border)}>
      <div>
        <p className="font-medium text-sm">{participant?.authUser?.username || 'Unknown'}</p>
        {booking.status === 'WAITLISTED' && booking.waitlistPosition && (
          <p className="text-xs text-foreground-muted">Waitlist #{booking.waitlistPosition}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn('text-xs', colors.text, colors.border)}>
          {booking.status}
        </Badge>

        {isPastClass && !isCancelled && booking.status === 'BOOKED' && (
          <div className="flex gap-1">
            <button
              onClick={() => onMarkAttendance([booking.id], 'ATTENDED')}
              className="p-1 rounded hover:bg-green-500/20 text-green-600"
              title="Mark attended"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMarkAttendance([booking.id], 'NO_SHOW')}
              className="p-1 rounded hover:bg-red-500/20 text-red-600"
              title="Mark no-show"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
