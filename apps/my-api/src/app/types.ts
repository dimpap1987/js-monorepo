import { SessionUserType } from '@js-monorepo/types'

export const ChannelRepo = Symbol()

export const AdminRepo = Symbol()

export const NotificationRepo = Symbol()

declare module 'express-session' {
  export interface SessionData {
    user: SessionUserType
  }
}
