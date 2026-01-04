'use client'

import { Badge } from '@js-monorepo/components/badge'
import { Skeleton } from '@js-monorepo/components/skeleton'
import {
  useWebSocketEvent,
  useWebSocketEmit,
  useWebSocketStatus,
  type BaseWebSocketEventMap,
} from '@js-monorepo/next/providers'
import { useEffect, useState } from 'react'
import { FaCircle } from 'react-icons/fa6'
import { DisconnectUserComponent } from './components/disconnect-user'

export type OnlineUsersType = {
  id: number
  username: string
  socketId?: string
  roles: string[]
}

type OnlineUsersEventMap = BaseWebSocketEventMap & {
  'events:online-users': OnlineUsersType[]
}

export default function OnlineUsersTableComponent() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsersType[] | []>([])
  const [loading, setLoading] = useState(true)
  const { isConnected } = useWebSocketStatus()
  const emit = useWebSocketEmit()

  // Subscribe to online users events
  useWebSocketEvent<OnlineUsersEventMap, 'events:online-users'>('events:online-users', (users) => {
    if (users) {
      setOnlineUsers(users)
      setLoading(false)
    }
  })

  // Subscribe to connect event and emit subscription
  useWebSocketEvent<OnlineUsersEventMap, 'connect'>('connect', () => {
    emit('subscribe:online-users', {})
  })

  // Emit subscription when connected
  useEffect(() => {
    if (isConnected) {
      emit('subscribe:online-users', {})
    }
  }, [isConnected, emit])

  const groupedUsers = onlineUsers?.reduce(
    (acc, user) => {
      if (!acc[user.id]) {
        acc[user.id] = {
          username: user.username,
          roles: user.roles,
          count: 0,
        }
      }
      acc[user.id] = {
        ...user,
        count: ++acc[user.id].count,
      }
      return acc
    },
    {} as Record<
      number,
      {
        username: string
        count: number
        roles: string[]
      }
    >
  )

  return (
    <div className="flex flex-col border border-border rounded-lg bg-card shadow-sm overflow-hidden">
      <div className="overflow-auto">
        <table className="w-full">
          {!loading && (
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="p-3 pl-4 text-left"></th>
                <th className="p-3 text-left text-sm font-semibold text-foreground">Username</th>
                <th className="p-3 text-center text-sm font-semibold text-foreground">WebSockets</th>
                <th className="p-3 text-center text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
          )}
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-border">
                    <td className="p-3 pl-4">
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-8 w-20 mx-auto" />
                    </td>
                  </tr>
                ))
              : Object.entries(groupedUsers).map(([userId, user]) => (
                  <tr key={userId} className="border-b border-border hover:bg-accent transition-colors duration-150">
                    <td className="p-3 pl-4">
                      <FaCircle className="text-status-success animate-pulse" />
                    </td>
                    <td className="p-3">
                      <div className="text-sm font-medium text-foreground">{user.username}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <Badge variant="secondary">{user.count}</Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <DisconnectUserComponent user={{ id: Number(userId), ...user }}></DisconnectUserComponent>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
