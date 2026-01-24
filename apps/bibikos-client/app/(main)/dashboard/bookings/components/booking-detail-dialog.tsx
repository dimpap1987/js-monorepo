'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@js-monorepo/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@js-monorepo/components/ui/avatar'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import { Label } from '@js-monorepo/components/ui/label'
import { Separator } from '@js-monorepo/components/ui/separator'
import { Textarea } from '@js-monorepo/components/ui/textarea'
import { cn } from '@js-monorepo/ui/util'
import { format, parseISO } from 'date-fns'
import { Calendar, Clock, Edit, User, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BOOKING_STATUS, BOOKING_STATUS_COLORS } from '../../../../../lib/scheduling'
import type { BookingDetailDialogProps } from '../types'

export function BookingDetailDialog({ booking, isOpen, onClose, onUpdateNotes, onCancel }: BookingDetailDialogProps) {
  const [notes, setNotes] = useState(booking?.organizerNotes || '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Reset state when booking changes
  useEffect(() => {
    if (booking) {
      setNotes(booking.organizerNotes || '')
      setIsEditingNotes(false)
      setIsCancelling(false)
      setCancelReason('')
    }
  }, [booking])

  if (!booking) return null

  const schedule = booking.classSchedule
  const participant = booking.participant
  const colors = BOOKING_STATUS_COLORS[booking.status]

  const participantName =
    participant?.appUser?.authUser?.firstName && participant?.appUser?.authUser?.lastName
      ? `${participant.appUser.authUser.firstName} ${participant.appUser.authUser.lastName}`
      : participant?.appUser?.authUser?.username || 'Unknown Participant'

  const participantInitials = participantName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSaveNotes = async () => {
    await onUpdateNotes(booking.id, notes)
    setIsEditingNotes(false)
  }

  const handleCancel = async () => {
    await onCancel(booking.id, cancelReason || undefined)
    setIsCancelling(false)
    setCancelReason('')
    onClose()
  }

  const getStatusLabel = () => {
    switch (booking.status) {
      case BOOKING_STATUS.BOOKED:
        return 'Booked'
      case BOOKING_STATUS.WAITLISTED:
        return 'Waitlisted'
      case BOOKING_STATUS.CANCELLED:
        return 'Cancelled'
      case BOOKING_STATUS.ATTENDED:
        return 'Attended'
      case BOOKING_STATUS.NO_SHOW:
        return 'No Show'
      default:
        return booking.status
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl">Booking Details</DialogTitle>
            <DialogDescription>View and manage participant booking information</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header Section - Participant & Status */}
            <div className="flex items-start gap-4 pb-4 border-b">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {participantInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold mb-1">{participantName}</h3>
                    {participant?.appUser?.authUser?.username && (
                      <div className="flex items-center gap-2 text-sm text-foreground-muted">
                        <User className="w-4 h-4" />
                        <span className="truncate">@{participant.appUser.authUser.username}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className={cn('text-sm px-3 py-1', colors.text, colors.border, colors.bg)}>
                    {getStatusLabel()}
                    {booking.status === BOOKING_STATUS.WAITLISTED && booking.waitlistPosition && (
                      <span className="ml-2">#{booking.waitlistPosition}</span>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Class Information */}
              {schedule && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground-muted mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Class Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-foreground-muted mb-1">Class</p>
                        <p className="font-medium">{schedule.class?.title || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground-muted mb-1">Date</p>
                        <p className="font-medium">{format(parseISO(schedule.startTimeUtc), 'EEEE, MMMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground-muted mb-1">Time</p>
                        <p className="font-medium">
                          {format(parseISO(schedule.startTimeUtc), 'h:mm a')} -{' '}
                          {format(parseISO(schedule.endTimeUtc), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Column - Booking Timeline */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground-muted mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Booking Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-foreground-muted mb-1">Booked</p>
                      <p className="font-medium text-sm">{format(parseISO(booking.bookedAt), 'PPp')}</p>
                    </div>
                    {booking.cancelledAt && (
                      <div>
                        <p className="text-xs text-foreground-muted mb-1">Cancelled</p>
                        <p className="font-medium text-sm">{format(parseISO(booking.cancelledAt), 'PPp')}</p>
                        {booking.cancelReason && (
                          <p className="text-xs text-foreground-muted mt-1 italic">
                            &ldquo;{booking.cancelReason}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                    {booking.attendedAt && (
                      <div>
                        <p className="text-xs text-foreground-muted mb-1">Attended</p>
                        <p className="font-medium text-sm">{format(parseISO(booking.attendedAt), 'PPp')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Organizer Notes Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground-muted flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Organizer Notes
                </h4>
                {!isEditingNotes && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingNotes(true)} className="h-8">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Notes
                  </Button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this participant (e.g., preferences, special requests, etc.)..."
                    rows={5}
                    className="resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setIsEditingNotes(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveNotes}>
                      Save Notes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-border bg-muted/30 min-h-[80px]">
                  <p className="text-sm text-foreground-muted whitespace-pre-wrap">
                    {booking.organizerNotes || (
                      <span className="italic text-foreground-muted/60">No notes added yet</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <Separator />
            <div className="flex justify-end gap-2">
              {(booking.status === BOOKING_STATUS.BOOKED || booking.status === BOOKING_STATUS.WAITLISTED) && (
                <Button variant="destructive" onClick={() => setIsCancelling(true)} className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Cancel Booking
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelling} onOpenChange={setIsCancelling}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? The participant will be notified via email and in-app
              notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Cancellation Reason (optional)</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation (e.g., class cancelled, schedule conflict, etc.)..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-foreground-muted">
                This reason will be included in the cancellation notification sent to the participant.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCancelling(false)}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
