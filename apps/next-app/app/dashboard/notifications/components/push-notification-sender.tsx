'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Card } from '@js-monorepo/components/ui/card'
import { useNotifications } from '@js-monorepo/notification'
import { SelectUsersComponent } from '@next-app/components/select-users'
import { useState } from 'react'
import { useSubmitPushNotification } from '../queries'

export const PushNotificationSender = () => {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const { addNotification } = useNotifications()
  const submitPushNotificationMutation = useSubmitPushNotification()

  const handleSendMessage = async () => {
    try {
      await submitPushNotificationMutation.mutateAsync({
        message,
        title,
        receiverIds: selectedUserIds,
      })
      addNotification({
        message: 'Push Notification send successfully!',
        type: 'success',
      })
      setTitle('')
      setMessage('')
    } catch (error) {
      addNotification({
        message: 'Error sending Push Notification',
        type: 'error',
      })
    }
  }

  return (
    <Card className="space-y-4 w-full p-6 bg-card border border-border">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          placeholder="Enter notification title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-border rounded-lg p-3 bg-background text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        />
      </div>

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

      <Button
        size="lg"
        className="w-full"
        variant="accent"
        onClick={handleSendMessage}
        disabled={title.trim().length === 0 || message.trim().length === 0 || selectedUserIds.length === 0}
      >
        Send Push Notification
      </Button>
    </Card>
  )
}
