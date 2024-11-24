'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Marquee } from '@js-monorepo/components/marquee'
import { useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { cn } from '@js-monorepo/ui/util'
import { useEffect, useState } from 'react'

export function AnnouncementsComponent({
  className,
  websocketOptions,
  eventName = 'events:announcements',
}: {
  className?: string
  websocketOptions: WebSocketOptionsType
  eventName?: string
}) {
  const { isLoggedIn } = useSession()
  const [announcements, setAnnouncements] = useState<string[] | []>([])

  const { socket } = useWebSocket(websocketOptions, isLoggedIn)

  useEffect(() => {
    if (socket?.active) {
      socket.on(eventName, (messages: string[]) => {
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
      className={cn(`w-full`, className)}
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
