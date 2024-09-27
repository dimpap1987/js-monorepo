'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { emit } from 'process'
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
    socket?.emit('emit:join-admin-room', {})
    socket?.on('event:online-users', (users) => setOnlineUsers(users))

    return () => {
      socket?.off('event:online-users')
    }
  }, [socket])

  return (
    <div className="container mx-auto flex justify-center w-full">
      <div className=" pl-4 flex flex-col">
        <div className="bg-white text-sm text-gray-500 font-bold px-5 py-2 shadow border-b border-gray-300">
          Online Users
        </div>

        <div
          className="w-full overflow-auto shadow bg-white"
          id="journal-scroll"
        >
          <table className="w-full">
            <tbody className="">
              {onlineUsers?.map((user) => (
                <tr
                  key={user.id}
                  className="relative text-xs py-1 border-b-2 border-blue-100 cursor-default"
                >
                  <td className="pl-2 pr-3 whitespace-no-wrap">
                    <FaCircle className="text-green-500" />
                  </td>

                  <td className="px-2 py-2 whitespace-no-wrap">
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
    </div>
  )
}
