'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Card } from '@js-monorepo/components/ui/card'
import { useNotifications } from '@js-monorepo/notification'
import { SelectUsersComponent } from '@next-app/components/select-users'
import { useState } from 'react'
import { useSubmitNotification } from '../queries'

export const NotificationSender = () => {
  const { session } = useSession()
  const [message, setMessage] = useState<string>('')
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const { addNotification } = useNotifications()
  const user = session?.user
  const submitNotificationMutation = useSubmitNotification()

  const handleSendMessage = async () => {
    if (user && message.trim() && selectedUserIds.length > 0) {
      try {
        await submitNotificationMutation.mutateAsync({
          message: message.trim(),
          receiverIds: selectedUserIds,
          senderId: user.id,
        })
        setMessage('')
        addNotification({
          message: 'Notification send successfully!',
          type: 'success',
        })
      } catch (error) {
        addNotification({
          message: 'Error sending Notification',
          type: 'error',
        })
      }
    }
  }

  return (
    <Card className="space-y-4 w-full p-6 bg-card border border-border">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Message</label>
        <textarea
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-border rounded-lg p-3 bg-background text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Select Users</label>
        <SelectUsersComponent
          onChange={(selected) => {
            setSelectedUserIds(selected.map((u) => u.id))
          }}
          selectedUserIds={selectedUserIds}
          classNameTrigger="w-full border border-border bg-background text-foreground hover:bg-accent"
          className="text-foreground"
        />
      </div>

      <DpButton
        size="large"
        variant="accent"
        className="w-full"
        onClick={handleSendMessage}
        disabled={message?.trim()?.length === 0 || !(selectedUserIds?.length > 0)}
      >
        Send Notification
      </DpButton>
    </Card>
  )
}
