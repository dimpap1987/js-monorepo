'use client'

import { Marquee } from '@js-monorepo/components/marquee'
import { useWebSocketEvent, type BaseWebSocketEventMap } from '@js-monorepo/next/providers'
import { cn } from '@js-monorepo/ui/util'
import { useState } from 'react'

const ANNOUNCEMENTS_EVENT = 'events:announcements' as const

type AnnouncementsEventMap = BaseWebSocketEventMap & {
  [ANNOUNCEMENTS_EVENT]: string[]
}

export function AnnouncementsComponent({ className }: { className: string }) {
  const [announcements, setAnnouncements] = useState<string[] | []>([])

  // Subscribe to announcements events
  useWebSocketEvent<AnnouncementsEventMap, typeof ANNOUNCEMENTS_EVENT>(ANNOUNCEMENTS_EVENT, (messages) => {
    if (messages) {
      setAnnouncements((prev) => [...prev, ...messages])
    }
  })

  return (
    <Marquee className={cn(`w-full`, className)} duration={15} onAnimationComplete={() => setAnnouncements([])}>
      {announcements.map((message, index) => (
        <span className="text-primary font-semibold text-sm tracking-wide select-none whitespace-nowrap" key={index}>
          {message}
        </span>
      ))}
    </Marquee>
  )
}
