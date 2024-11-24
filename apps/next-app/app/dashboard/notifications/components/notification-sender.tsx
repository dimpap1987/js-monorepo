'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Card } from '@js-monorepo/components/card'
import { MultiSelectDropdown } from '@js-monorepo/components/multiselect'
import { useNotifications } from '@js-monorepo/notification'
import { useEffect, useState } from 'react'
import { findUsers, submitNotification } from '../utils'
import { UserDropdown } from './types'

export const NotificationSender = () => {
  const { user } = useSession()
  const [message, setMessage] = useState<string>('')
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [usersDropDown, setUsersDropDown] = useState<UserDropdown[]>([])
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

  useEffect(() => {
    findUsers().then((users) =>
      setUsersDropDown(
        users.users?.map((u) => ({ id: u.id, name: u.username }))
      )
    )
  }, [])

  return (
    <Card className="space-y-4 w-full p-5 bg-background/60">
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
