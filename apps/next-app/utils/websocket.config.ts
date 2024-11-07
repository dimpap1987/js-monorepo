import { WebSocketOptionsType } from '@js-monorepo/next/providers'

export const websocketOptions: WebSocketOptionsType = {
  url: process.env['NEXT_PUBLIC_WEBSOCKET_PRESENCE_URL'] ?? '',
}
