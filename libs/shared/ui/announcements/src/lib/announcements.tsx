'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Marquee } from '@js-monorepo/components/marquee'
import { useWebSocket } from '@js-monorepo/next/providers'
import { useEffect, useState } from 'react'

export function AnnouncementsComponent({ className }: { className?: string }) {
  const { isLoggedIn } = useSession()
  const [announcements, setAnnouncements] = useState<string[] | []>([])

  const socket = useWebSocket(
    process.env['NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL']!,
    isLoggedIn
  )

  useEffect(() => {
    if (socket?.active) {
      socket.on('event:announcements', (message: { data: string[] }) => {
        if (message?.data) {
          setAnnouncements((prev) => [...prev, ...message.data])
        }
      })
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
