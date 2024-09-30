'use client'

import { useSession } from '@js-monorepo/auth/next/client'
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

  return (
    <div className="flex flex-col p-1">
      <div className="bg-white p-2 text-sm text-center text-gray-500 font-bold px-5 py-2 shadow border-b border-gray-300 rounded-t-lg">
        Online Users
      </div>

      <div className="w-full overflow-auto shadow bg-white rounded-b-lg">
        <table className="w-full p-2 whitespace-nowrap">
          {!loading && (
            <thead>
              <tr className="border-b text-sm border-blue-100 text-gray-800 font-semibold">
                <th className="p-3 pl-4 px-3 text-left"></th>
                <th className="p-3 px-3 text-left">Username</th>
                <th className="p-3 px-3 text-left">Socket ID</th>
                <th className="p-3 px-3 text-left">Actions</th>
              </tr>
            </thead>
          )}
          <tbody>
            {loading
              ? // Render skeletons if loading
                Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className="relative border-t text-sm border-blue-100 cursor-default"
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
                    <td className="p-3 px-3">
                      <Skeleton className="h-3" />
                    </td>
                  </tr>
                ))
              : onlineUsers?.map((user) => (
                  <tr
                    key={user.socketId}
                    className="relative border-t text-sm border-blue-100 cursor-default"
                  >
                    <td className="p-3 pl-4 px-3">
                      <FaCircle className="text-green-500 animate-pulse" />
                    </td>

                    <td className="p-3 px-3">
                      <div className="leading-5 text-gray-500 font-medium">
                        {user.username}
                      </div>
                    </td>

                    <td className="p-3 px-3">
                      <div className="leading-5 text-gray-500 font-medium">
                        {user.socketId}
                      </div>
                    </td>
                    <td className="p-3 px-3"></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
