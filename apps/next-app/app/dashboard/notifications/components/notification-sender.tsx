'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Card } from '@js-monorepo/components/card'
import { Input } from '@js-monorepo/components/form'
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
    <Card className="space-y-4 w-full p-5">
      <Input
        type="text"
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full mt-2"
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
          className="w-full"
          onClick={handleSendMessage}
          disabled={message?.trim()?.length === 0}
        >
          Submit
        </DpButton>
      </div>
    </Card>
  )
}
