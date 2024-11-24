'use client'

import { DpButton } from '@js-monorepo/button'
import { Card } from '@js-monorepo/components/card'
import { MultiSelectDropdown } from '@js-monorepo/components/multiselect'
import { useNotifications } from '@js-monorepo/notification'
import { useEffect, useState } from 'react'
import { findUsers, submitPushNotification } from '../utils'
import { UserDropdown } from './types'

export const PushNotificationSender = () => {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [usersDropDown, setUsersDropDown] = useState<UserDropdown[]>([])
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

  useEffect(() => {
    findUsers().then((users) =>
      setUsersDropDown(
        users.users?.map((u) => ({ id: u.id, name: u.username }))
      )
    )
  }, [])

  return (
    <Card className="space-y-4 w-full p-5">
      <input
        type="text"
        placeholder="Enter notification title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2"
      />

      <textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2"
        rows={4}
      />

      <MultiSelectDropdown
        options={usersDropDown}
        onChange={(selected) => {
          setSelectedUserIds(selected.map((u) => u.id))
        }}
        prompt="Select users..."
        selectedIds={selectedUserIds}
      />

      <DpButton
        size="large"
        className="w-full"
        variant="accent"
        onClick={handleSendMessage}
        disabled={
          title.trim().length === 0 ||
          message.trim().length === 0 ||
          selectedUserIds.length === 0
        }
      >
        Send Push Notification
      </DpButton>
    </Card>
  )
}
