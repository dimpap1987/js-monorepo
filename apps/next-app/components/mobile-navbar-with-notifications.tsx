'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { MobileNavbar } from './mobile-navbar'

interface MobileNavbarWithNotificationsProps {
  userId: number | undefined
  isSidebarOpen: boolean
}

export function MobileNavbarWithNotifications({ userId, isSidebarOpen }: MobileNavbarWithNotificationsProps) {
  const queryClient = useQueryClient()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0)
      return
    }

    const updateCount = () => {
      const queries = queryClient.getQueriesData({ queryKey: ['notifications', 'user', userId] })
      for (const [, data] of queries) {
        if (data && typeof data === 'object' && 'unReadTotal' in data) {
          setUnreadCount((data as { unReadTotal?: number }).unReadTotal ?? 0)
          return
        }
      }
      setUnreadCount(0)
    }

    updateCount()

    const unsubscribe = queryClient.getQueryCache().subscribe(updateCount)
    return unsubscribe
  }, [userId, queryClient])

  if (!userId) return null

  return <MobileNavbar unreadNotificationCount={unreadCount} isSidebarOpen={isSidebarOpen} />
}
