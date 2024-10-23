'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { DpButton } from '@js-monorepo/button'
import { Input } from '@js-monorepo/components/form'
import { MultiSelectDropdown } from '@js-monorepo/components/multiselect'
import { AuthUserFullDto, NotificationCreateDto } from '@js-monorepo/types'
import { API } from '@next-app/api-proxy'
import React, { useEffect, useState } from 'react'

interface User {
  id: number
  name: string
}

const findUsers = async () => {
  const response = await API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/admin/users?page=0&pageSize=100`
  )
    .get()
    .withCredentials()
    .execute()

  if (response.ok)
    return response.data as {
      users: AuthUserFullDto[] | []
      totalCount: number
    }

  return {
    users: [],
    totalCount: 0,
  }
}

const submitNotifications = async (payload: NotificationCreateDto) => {
  const response = await API.url(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/notifications`
  )
    .post()
    .body(payload)
    .withCredentials()
    .withCsrf()
    .execute()
}

export const NotificationSender = () => {
  const { user } = useSession()
  const [message, setMessage] = useState<string>('')
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [usersDropDown, setUsersDropDown] = useState<User[]>([])

  const handleSendMessage = async () => {
    if (user && message.trim() && selectedUserIds.length > 0) {
      await submitNotifications({
        message: message.trim(),
        receiverIds: selectedUserIds,
        senderId: user.id,
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
    <div className="space-y-4 w-full">
      <Input
        type="text"
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full"
      />

      <MultiSelectDropdown
        options={usersDropDown}
        onChange={(selected) => {
          console.log(selected)
          setSelectedUserIds(selected.map((u) => u.id))
        }}
        prompt="Select users..."
        selectedIds={selectedUserIds}
      />

      <div>
        <DpButton className="w-full" onClick={handleSendMessage}>
          Send Message
        </DpButton>
      </div>
    </div>
  )
}
