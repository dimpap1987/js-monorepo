'use client'

import { Badge } from '@js-monorepo/components/badge'
import { Skeleton } from '@js-monorepo/components/skeleton'
import { useWebSocket } from '@js-monorepo/next/providers'
import { websocketOptions } from '@next-app/utils/websocket.config'
import { useEffect, useState } from 'react'
import { FaCircle } from 'react-icons/fa6'
import { DisconnectUserComponent } from './components/disconnect-user'

export type OnlineUsersType = {
  id: number
  username: string
  socketId?: string
  roles: string[]
}

export default function OnlineUsersTableComponent() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsersType[] | []>([])
  const [loading, setLoading] = useState(true)
  const { socket } = useWebSocket(websocketOptions, true)

  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      socket.emit('subscribe:online-users', {})
    }

    const handleOnlineUsersEvent = async (users: any) => {
      setOnlineUsers(users)
      setLoading(false)
    }

    socket.on('connect', handleConnect)
    socket.on('events:online-users', handleOnlineUsersEvent)

    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('events:online-users', handleOnlineUsersEvent)
    }
  }, [socket])

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
    <div className="flex flex-col p-2 bg-white border-b rounded-lg shadow overflow-hidden text-sm">
      <div className="overflow-auto whitespace-nowrap">
        <table className="w-full">
          {!loading && (
            <thead>
              <tr className="border-b border-blue-100 text-gray-800 font-semibold text-xs">
                <th className="p-1 pl-4 px-2 text-left"></th>
                <th className="p-1 px-2 text-left">Username</th>
                <th className="p-1 px-2 text-center">WebSockets</th>
                <th className="p-1 px-2 text-center">Actions</th>
              </tr>
            </thead>
          )}
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="relative border-t border-blue-100 cursor-default">
                    <td className="p-2 pl-2 px-2">
                      <Skeleton className="h-3 rounded-full" />
                    </td>
                    <td className="p-2 px-2">
                      <Skeleton className="h-3" />
                    </td>
                    <td className="p-2 px-2">
                      <Skeleton className="h-3" />
                    </td>
                    <td className="p-2 px-2">
                      <Skeleton className="h-3" />
                    </td>
                  </tr>
                ))
              : Object.entries(groupedUsers).map(([userId, user]) => (
                  <tr key={userId} className="relative border-t border-blue-100 cursor-default">
                    <td className="p-3 pl-4 px-3">
                      <FaCircle className="text-green-500 animate-pulse" />
                    </td>

                    <td className="p-3 px-3">
                      <div className="leading-5 text-gray-500 font-medium">
                        <span>{user.username}</span>
                      </div>
                    </td>
                    <td className="p-3 px-3">
                      <div className="leading-5 text-gray-500 font-medium text-center">
                        <Badge>{user.count}</Badge>
                      </div>
                    </td>
                    <td className="p-3 px-3 flex justify-center">
                      <DisconnectUserComponent user={{ id: Number(userId), ...user }}></DisconnectUserComponent>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
