'use client'

import { useState } from 'react'
import { Button } from '@js-monorepo/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@js-monorepo/components/ui/dialog'
import { Textarea } from '@js-monorepo/components/ui/textarea'
import { format, parseISO } from 'date-fns'
import { AlertTriangle, Calendar, Loader2 } from 'lucide-react'
import type { Booking } from '../../../../lib/scheduling'
import { useCancelBooking } from '../../../../lib/scheduling'

interface CancelBookingDialogProps {
  booking: Booking
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelBookingDialog({ booking, open, onOpenChange }: CancelBookingDialogProps) {
  const [reason, setReason] = useState('')
  const cancelBooking = useCancelBooking()

  const schedule = booking.classSchedule
  if (!schedule) return null

  const startTime = parseISO(schedule.startTimeUtc)

  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync({
        id: booking.id,
        cancelReason: reason || undefined,
      })
      onOpenChange(false)
      setReason('')
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="font-medium">{schedule.class?.title}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(startTime, 'EEEE, MMMM d, yyyy • h:mm a')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reason">Reason for cancellation (optional)</label>
            <Textarea
              id="reason"
              placeholder="Let us know why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cancelBooking.isPending}>
            Keep Booking
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={cancelBooking.isPending}>
            {cancelBooking.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Cancel Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
