import { useWebSocket, WebSocketOptionsType } from '@js-monorepo/next/providers'
import { Pageable, UserNotificationType } from '@js-monorepo/types'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useNotificationWebSocket(
  websocketOptions: WebSocketOptionsType,
  onReceive: (notification: UserNotificationType) => void
) {
  const { socket } = useWebSocket(websocketOptions, true)

  useEffect(() => {
    if (!socket) return
    const handleNotificationEvent = (event: any) => {
      if (event.data) onReceive(event.data)
    }
    socket.on('events:notifications', handleNotificationEvent)

    return () => {
      socket.off('events:notifications', handleNotificationEvent)
    }
  }, [socket, onReceive])

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

  const loadMore = useCallback(() => {
    if (isLoading || (totalPages && paginator.current.page >= totalPages))
      return

    setIsLoading(true)

    onPaginationChange({
      page: paginator.current.page + 1,
      pageSize: paginator.current.pageSize,
    })
      .then(() => {
        paginator.current.page += 1
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [isLoading, onPaginationChange, totalPages])

  return { loadMore, paginator, isLoading }
}
