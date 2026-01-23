'use client'

import { Button } from '@js-monorepo/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@js-monorepo/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@js-monorepo/components/ui/drawer'
import { AlertTriangle, Calendar, Clock, Loader2 } from 'lucide-react'
import { useScheduleTime } from '../../../../lib/datetime'
import type { DiscoverSchedule } from '../../../../lib/scheduling'

interface CancelBookingDialogProps {
  schedule: DiscoverSchedule
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading: boolean
}

export function CancelBookingDialog({ schedule, open, onOpenChange, onConfirm, isLoading }: CancelBookingDialogProps) {
  const { fullDate, timeRange } = useScheduleTime(schedule)
  const isWaitlisted = schedule?.myBooking?.status === 'WAITLISTED'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {isWaitlisted ? 'Leave Waitlist' : 'Cancel Booking'}
          </DialogTitle>
          <DialogDescription>
            {isWaitlisted
              ? 'Are you sure you want to leave the waitlist for this class?'
              : 'Are you sure you want to cancel your booking for this class?'}
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{fullDate}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{timeRange}</span>
          </div>
          <div className="text-sm font-medium">{schedule.class?.title}</div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Keep Booking
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isWaitlisted ? 'Leave Waitlist' : 'Cancel Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CancelBookingDrawer({ schedule, open, onOpenChange, onConfirm, isLoading }: CancelBookingDialogProps) {
  const { fullDate, timeRange } = useScheduleTime(schedule)
  const isWaitlisted = schedule?.myBooking?.status === 'WAITLISTED'
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-5">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {isWaitlisted ? 'Leave Waitlist' : 'Cancel Booking'}
          </DrawerTitle>
          <DrawerDescription>
            {isWaitlisted
              ? 'Are you sure you want to leave the waitlist for this class?'
              : 'Are you sure you want to cancel your booking for this class?'}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{fullDate}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{timeRange}</span>
          </div>
          <div className="text-sm font-medium">{schedule.class?.title}</div>
        </div>
        <DrawerFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Keep Booking
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isWaitlisted ? 'Leave Waitlist' : 'Cancel Booking'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
