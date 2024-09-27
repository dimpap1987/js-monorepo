'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Marquee } from '@js-monorepo/components/marquee'
import { useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { useEffect, useState } from 'react'

const websocketOptions: WebSocketOptionsType = {
  url: process.env['NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL'] ?? '',
}

export function AnnouncementsComponent({
  className,
  opts = websocketOptions,
  eventName = 'events:announcements',
}: {
  className?: string
  opts?: WebSocketOptionsType
  eventName?: string
}) {
  const { isLoggedIn } = useSession()
  const [announcements, setAnnouncements] = useState<string[] | []>([])

  const socket = useWebSocket(opts, isLoggedIn)

  useEffect(() => {
    if (socket?.active) {
      socket.on(eventName, (messages: string[]) => {
        console.log(messages)

        if (messages) {
          setAnnouncements((prev) => [...prev, ...messages])
        }
      })
    }
    return () => {
      socket?.off(eventName)
    }
  }, [socket])

  return (
    <Marquee
      className={className}
      duration={15}
      onAnimationComplete={() => setAnnouncements([])}
    >
      {announcements.map((message, index) => (
        <span
          className="dark:text-lime-300 font-semibold tracking-wider font-mono select-none"
          key={index}
        >
          {message}
        </span>
      ))}
    </Marquee>
  )
}
