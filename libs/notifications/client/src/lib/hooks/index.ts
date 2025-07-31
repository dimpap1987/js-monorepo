'use client'

import { useSocketChannel, useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { Pageable, UserNotificationType } from '@js-monorepo/types'
import { useCallback, useRef, useState } from 'react'

export function useNotificationWebSocket(
  connect: boolean,
  websocketOptions: WebSocketOptionsType,
  onReceive: (notification: UserNotificationType) => void
) {
  const { socket } = useWebSocket(websocketOptions, connect)

  useSocketChannel(socket, 'events:notifications', (event: any) => {
    if (event?.data) onReceive(event.data)
  })

  return socket
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
