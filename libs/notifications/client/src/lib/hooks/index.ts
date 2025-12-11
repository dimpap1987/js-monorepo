'use client'

import { useWebSocketEvent } from '@js-monorepo/next/providers'
import { Pageable, UserNotificationType } from '@js-monorepo/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NOTIFICATIONS_EVENT, type NotificationWebSocketEventMap } from '../types/websocket-events'

export function useNotificationWebSocket(onReceive: (notification: UserNotificationType) => void): void {
  const handlerRef = useRef(onReceive)

  useEffect(() => {
    handlerRef.current = onReceive
  }, [onReceive])

  useWebSocketEvent<NotificationWebSocketEventMap, typeof NOTIFICATIONS_EVENT>(NOTIFICATIONS_EVENT, (data) => {
    if (data && typeof data === 'object' && 'data' in data) {
      handlerRef.current(data.data)
    }
  })
}

export function usePagination({
  page,
  pageSize,
  totalPages,
  onPaginationChange,
}: Pageable & {
  onPaginationChange: ({ page, pageSize }: Pageable) => Promise<any>
} & { totalPages?: number }) {
  const paginator = useRef({ page, pageSize })
  const [isLoading, setIsLoading] = useState(false)

  const setPaginator = (_page: number, _pageSize: number) => {
    paginator.current = {
      page: _page,
      pageSize: _pageSize,
    }
  }

  const loadMore = useCallback(async () => {
    if (isLoading || (totalPages && paginator.current.page >= totalPages)) return

    setIsLoading(true)

    paginator.current.page = paginator.current.page + 1
    try {
      await onPaginationChange({
        page: paginator.current.page,
        pageSize: paginator.current.pageSize,
      })
    } catch (e) {
      paginator.current.page = paginator.current.page - 1
    }

    setIsLoading(false)
  }, [isLoading, onPaginationChange, totalPages])

  return { loadMore, paginator, isLoading, setPaginator }
}
