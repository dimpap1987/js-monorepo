'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import { ContactCategory, ContactMessageDto, ContactStatus } from '@js-monorepo/types'
import { useTimezone } from '@js-monorepo/next/hooks'
import { formatForUser } from '@js-monorepo/utils/date'

const CATEGORY_COLORS: Record<ContactCategory, string> = {
  general: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  support: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  feedback: 'bg-green-500/10 text-green-500 border-green-500/20',
  bug: 'bg-red-500/10 text-red-500 border-red-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

const STATUS_COLORS: Record<ContactStatus, string> = {
  unread: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  read: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  archived: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
}

interface ContactMessageDialogProps {
  message: ContactMessageDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactMessageDialog({ message, open, onOpenChange }: ContactMessageDialogProps) {
  const userTimezone = useTimezone()

  if (!message) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-5">
            <span className="truncate">Contact Message</span>
            <Badge variant="outline" className={CATEGORY_COLORS[message.category]}>
              {message.category}
            </Badge>
            <Badge variant="outline" className={STATUS_COLORS[message.status]}>
              {message.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="py-2">From {message.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Received: {formatForUser(new Date(message.createdAt), userTimezone)}</span>
            {message.user && (
              <span>
                Logged in user: <strong>{message.user.username}</strong>
              </span>
            )}
          </div>

          <div className="border rounded-lg p-4 bg-muted">
            <h4 className="font-semibold mb-2">Message:</h4>
            <p className="whitespace-pre-wrap text-foreground bg-secondary p-2 rounded-lg">{message.message}</p>
          </div>

          <div className="flex gap-2 justify-end">
            <a
              href={`mailto:${message.email}?subject=Re: Your ${message.category} inquiry`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:brightness-90 h-10 px-4 py-2"
            >
              Reply via Email
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
