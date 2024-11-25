'use client'

import { DpButton } from '@js-monorepo/button'
import { Card } from '@js-monorepo/components/card'
import { useNotifications } from '@js-monorepo/notification'
import { SelectUsersComponent } from '@next-app/components/select-users'
import { API } from '@next-app/utils/api-proxy'
import { useState } from 'react'

const CreateAnnouncement = () => {
  const [message, setMessage] = useState<string>('')
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const { addNotification } = useNotifications()

  const handleSendMessage = async () => {
    if (message.trim() && selectedUserIds.length > 0) {
      const submitResponse = await API.url(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/api/announcements`
      )
        .post()
        .body({ announcement: message.trim() })
        .withCredentials()
        .withCsrf()
        .execute()

      if (submitResponse.ok) {
        setMessage('')
      } else {
        addNotification({
          message: 'Error sending Announcement',
          type: 'error',
        })
      }
    }
  }

  return (
    <Card className="space-y-4 w-full p-5">
      <textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2"
        rows={4}
      />

      <SelectUsersComponent
        onChange={(selected) => {
          setSelectedUserIds(selected.map((u) => u.id))
        }}
        selectedUserIds={selectedUserIds}
      />

      <DpButton
        size="large"
        className="w-full"
        variant="accent"
        onClick={handleSendMessage}
        disabled={message.trim().length === 0 || selectedUserIds.length === 0}
      >
        Send Announcement
      </DpButton>
    </Card>
  )
}

export { CreateAnnouncement }
