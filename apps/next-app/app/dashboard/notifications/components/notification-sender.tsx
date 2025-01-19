'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Card } from '@js-monorepo/components/card'
import { useNotifications } from '@js-monorepo/notification'
import { SelectUsersComponent } from '@next-app/components/select-users'
import { useState } from 'react'
import { submitNotification } from '../utils'

export const NotificationSender = () => {
  const {
    session: { user },
  } = useSession()
  const [message, setMessage] = useState<string>('')
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const { addNotification } = useNotifications()

  const handleSendMessage = async () => {
    if (user && message.trim() && selectedUserIds.length > 0) {
      const submitResponse = await submitNotification({
        message: message.trim(),
        receiverIds: selectedUserIds,
        senderId: user.id,
      })
      if (submitResponse.ok) {
        setMessage('')
        addNotification({
          message: 'Notification send successfully!',
          type: 'success',
        })
      } else {
        addNotification({
          message: 'Error sending Notification',
          type: 'error',
        })
      }
    }
  }

  return (
    <Card className="space-y-4 w-full p-5 bg-background-secondary">
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

      <div>
        <DpButton
          size="large"
          variant="accent"
          className="w-full"
          onClick={handleSendMessage}
          disabled={
            message?.trim()?.length === 0 || !(selectedUserIds?.length > 0)
          }
        >
          Send Notification
        </DpButton>
      </div>
    </Card>
  )
}
