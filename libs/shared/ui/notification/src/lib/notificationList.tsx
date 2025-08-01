'use client'

import { cn } from '@js-monorepo/ui/util'
import { useEffect, useState } from 'react'
import { DpNotificationProps, NotificationItem, OnClose } from './notification'

interface DpNotificationListProps {
  notifications: DpNotificationProps[]
  readonly className?: string
  readonly removeNotification?: OnClose
  readonly style?: React.CSSProperties
}

export default function DpNotificationList({
  notifications,
  className,
  removeNotification,
  style,
}: DpNotificationListProps) {
  const [navbarHeight, setNavbarHeight] = useState<number | null>(null)
  const [topOffset, setTopOffset] = useState<number>(navbarHeight ?? 0)

  useEffect(() => {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')?.trim()
    const parsed = parseInt(cssVar, 10)
    if (!isNaN(parsed)) {
      setNavbarHeight(parsed)
    }
  }, [])

  useEffect(() => {
    if (navbarHeight === null) return

    const height = navbarHeight
    let animationFrameId: number | null = null

    function handleScroll() {
      if (animationFrameId !== null) return // Skip if already queued

      animationFrameId = window.requestAnimationFrame(() => {
        const offset = Math.max(height - window.scrollY, 0)
        setTopOffset(offset)
        animationFrameId = null
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [navbarHeight])

  if (!notifications?.length) return null

  return (
    <section
      style={{
        top: `${topOffset}px`,
        ...style,
      }}
      className={cn(`fixed right-0 z-30 flex flex-col-reverse w-0 transition-top duration-300 ease-in-out`, className)}
    >
      {notifications.map((notification, index) => (
        <NotificationItem key={notification.id || index} {...notification} removeNotification={removeNotification} />
      ))}
    </section>
  )
}
