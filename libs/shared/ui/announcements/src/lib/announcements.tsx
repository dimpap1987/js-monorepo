'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Marquee } from '@js-monorepo/components/marquee'
import { useSocketChannel, useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { cn } from '@js-monorepo/ui/util'
import { useState } from 'react'

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

  useSocketChannel<string[]>(socket, eventName, (messages) => {
    if (messages) {
      setAnnouncements((prev) => [...prev, ...messages])
    }
  })

  return (
    <Marquee className={cn(`w-full`, className)} duration={15} onAnimationComplete={() => setAnnouncements([])}>
      {announcements.map((message, index) => (
        <span
          className="text-lime-600 dark:text-lime-300 font-semibold tracking-wider font-mono select-none"
          key={index}
        >
          {message}
        </span>
      ))}
    </Marquee>
  )
}
