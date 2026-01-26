import { ScheduleDateParts } from '../lib/datetime'

interface DateBadgeProps {
  dateParts: ScheduleDateParts
  isPastBooking?: boolean
}

export function DateBadge({ dateParts, isPastBooking = false }: DateBadgeProps) {
  return (
    <div className="flex-shrink-0 w-14 text-center">
      <div className={`rounded-lg p-2 ${isPastBooking ? 'bg-muted' : 'bg-secondary'}`}>
        <div className={`text-xs font-medium uppercase ${isPastBooking ? 'text-muted-foreground' : 'text-primary'}`}>
          {dateParts.month}
        </div>
        <div className={`text-xl font-bold ${isPastBooking ? 'text-muted-foreground' : 'text-primary'}`}>
          {dateParts.day}
        </div>
      </div>
    </div>
  )
}
