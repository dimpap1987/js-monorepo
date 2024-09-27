'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { useEffect, useState } from 'react'
import { FaCircle } from 'react-icons/fa6'

export type OnlineUsersType = {
  id: number
  username: string
  roles: []
}
export const websocketOptions: WebSocketOptionsType = {
  url: process.env['NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL'] ?? '',
}

export default function OnlineUsersTableComponent() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsersType[] | []>([])
  const { isLoggedIn } = useSession()
  const socket = useWebSocket(websocketOptions, isLoggedIn)

  useEffect(() => {
    socket?.emit('subscribe:online-users', {})

    socket?.on('event:online-users', (users) => setOnlineUsers(users))
    return () => {
      socket?.off('event:online-users')
    }
  }, [socket])

  return (
    <div className="flex flex-col p-1">
      <div className="bg-white p2 text-sm text-center text-gray-500 font-bold px-5 py-2 shadow border-b border-gray-300 rounded-t-lg">
        Online Users
      </div>

      <div className="w-full overflow-auto shadow bg-white rounded-b-lg">
        <table className="w-full p-2">
          <tbody>
            {onlineUsers?.map((user) => (
              <tr
                key={user.id}
                className="relative border-t text-sm border-blue-100 cursor-default"
              >
                <td className="p-3 pl-4 px-3 whitespace-no-wrap">
                  <FaCircle className="text-green-500 animate-pulse" />
                </td>

                <td className="p-3 px-3 whitespace-no-wrap">
                  <div className="leading-5 text-gray-500 font-medium">
                    {user.username}
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
