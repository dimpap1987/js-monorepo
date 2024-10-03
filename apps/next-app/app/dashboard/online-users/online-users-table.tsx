'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Badge } from '@js-monorepo/components/badge'
import { Skeleton } from '@js-monorepo/components/skeleton'
import { useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { useEffect, useState } from 'react'
import { FaCircle } from 'react-icons/fa6'

export type OnlineUsersType = {
  id: number
  username: string
  socketId: string
  roles: []
}

export const websocketOptions: WebSocketOptionsType = {
  url: process.env['NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL'] ?? '',
}

async function wait(miliSeconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, miliSeconds)
  })
}

export default function OnlineUsersTableComponent() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsersType[] | []>([])
  const [loading, setLoading] = useState(true)
  const { isLoggedIn } = useSession()
  const socket = useWebSocket(websocketOptions, isLoggedIn)

  useEffect(() => {
    socket?.emit('subscribe:online-users', {})

    socket?.on('event:online-users', async (users) => {
      await wait(600)
      setOnlineUsers(users)
      setLoading(false)
    })
    return () => {
      socket?.off('event:online-users')
    }
  }, [socket])

  const groupedUsers = onlineUsers?.reduce(
    (acc, user) => {
      if (!acc[user.username]) {
        acc[user.username] = 0
      }
      acc[user.username]++
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="flex flex-col p-2 bg-white border-b rounded-lg shadow overflow-hidden text-sm">
      <div className="text-center text-gray-500 font-bold py-1 shadow rounded-lg border-gray-300">
        Online Users
      </div>

      <div className="overflow-auto whitespace-nowrap">
        <table className="w-full">
          {!loading && (
            <thead>
              <tr className="border-b border-blue-100 text-gray-800 font-semibold">
                <th className="p-3 pl-4 px-3 text-left"></th>
                <th className="p-3 px-3 text-left">Username</th>
                <th className="p-3 px-3 text-center">Devices</th>
              </tr>
            </thead>
          )}
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className="relative border-t border-blue-100 cursor-default"
                  >
                    <td className="p-3 pl-4 px-3">
                      <Skeleton className="h-3 rounded-full" />
                    </td>
                    <td className="p-3 px-3">
                      <Skeleton className="h-3" />
                    </td>
                    <td className="p-3 px-3">
                      <Skeleton className="h-3" />
                    </td>
                    {/* <td className="p-3 px-3">
                      <Skeleton className="h-3" />
                    </td> */}
                  </tr>
                ))
              : Object.entries(groupedUsers).map(([username, count]) => (
                  <tr
                    key={username}
                    className="relative border-t border-blue-100 cursor-default"
                  >
                    <td className="p-3 pl-4 px-3">
                      <FaCircle className="text-green-500 animate-pulse" />
                    </td>

                    <td className="p-3 px-3">
                      <div className="leading-5 text-gray-500 font-medium">
                        <span>{username}</span>
                      </div>
                    </td>
                    <td className="p-3 px-3">
                      <div className="leading-5 text-gray-500 font-medium text-center">
                        <Badge className="">{count}</Badge>
                      </div>
                    </td>
                    {/* <td className="p-3 px-3"></td> */}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
