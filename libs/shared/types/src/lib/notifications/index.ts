export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]

export type NotificationCreateDto = {
  receiverIds: number[]
  senderId?: number
  message: string
  link?: string
  type?: string
  additionalData?: JsonValue
}

export type NotificationDto = {
  receiverId: number
  notificationId: number
  senderId: number
  isRead: boolean
}

export type EventsReponseType = 'notification' | 'announcement'

export interface EventsReponse<T = any> {
  id: string
  data: T
  time: Date
  type: EventsReponseType
}

export type NotificationDetailsType = {
  id: number
  isArchived?: boolean
  createdAt: Date | string
  message: string
  link?: string
  additionalData?: JsonValue
}

export type NotificationUserType = {
  id: number
  username: string
}

export type SenderType = NotificationUserType

export type UserNotificationType = {
  isRead: boolean
  notification: NotificationDetailsType
  sender?: SenderType
  user?: NotificationUserType
}

export interface CreatePushNotificationType {
  receiverIds: number[]
  message: string
  title: string
  url?: string
}

export interface CreateUserNotificationType {
  id: number
  createdAt: Date
  message: string
  link?: string
  additionalData?: JsonValue
}
