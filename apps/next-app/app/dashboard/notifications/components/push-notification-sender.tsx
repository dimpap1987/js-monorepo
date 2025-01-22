'use client'

import { DpButton } from '@js-monorepo/button'
import { Card } from '@js-monorepo/components/card'
import { useNotifications } from '@js-monorepo/notification'
import { SelectUsersComponent } from '@next-app/components/select-users'
import { useState } from 'react'
import { submitPushNotification } from '../utils'

export const PushNotificationSender = () => {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const { addNotification } = useNotifications()

  const handleSendMessage = async () => {
    const response = await submitPushNotification({
      message,
      title,
      receiverIds: selectedUserIds,
    })
    if (response.ok) {
      addNotification({
        message: 'Push Notification send successfully!',
        type: 'success',
      })
      setTitle('')
      setMessage('')
    } else {
      addNotification({
        message: 'Error sending Push Notification',
        type: 'error',
      })
    }
  }

  return (
    <Card className="space-y-4 w-full p-5 bg-background-secondary">
      <input
        type="text"
        placeholder="Enter notification title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 bg-gray-900 text-white"
      />

      <textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 bg-gray-900 text-white"
        rows={4}
      />

      <SelectUsersComponent
        onChange={(selected) => {
          setSelectedUserIds(selected.map((u) => u.id))
        }}
        selectedUserIds={selectedUserIds}
        classNameTrigger="text-white bg-gray-900"
        className="text-white"
      />

      <DpButton
        size="large"
        className="w-full"
        variant="accent"
        onClick={handleSendMessage}
        disabled={title.trim().length === 0 || message.trim().length === 0 || selectedUserIds.length === 0}
      >
        Send Push Notification
      </DpButton>
    </Card>
  )
}
