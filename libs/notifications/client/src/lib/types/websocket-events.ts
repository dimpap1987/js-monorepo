import type { BaseWebSocketEventMap, WebSocketEventMap } from '@js-monorepo/next/providers'
import type { UserNotificationType } from '@js-monorepo/types'

export const NOTIFICATIONS_EVENT = 'events:notifications' as const

export interface NotificationWebSocketEventMap extends BaseWebSocketEventMap {
  [NOTIFICATIONS_EVENT]: { data: UserNotificationType }
  'events:refresh-session': boolean
  'events:announcements': string[]
  'events:online-users': any[]
}

export type { WebSocketEventMap }
