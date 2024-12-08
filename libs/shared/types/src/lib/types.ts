export interface SessionUserType {
  id: number
  username: string
  createdAt?: Date
  lastLoggedIn?: string
  isAdmin?: boolean
  profile: {
    id?: number
    image?: string | null
    provider?: string
  }
  roles: string[]
}

export interface SessionPayload {
  user: SessionUserType
}

export type SuccessResponse<T = any> = {
  ok: true
  data?: T
  message?: string
  status: number
}

export type ErrorResponse = {
  ok: false
  message?: string
  errors?: string[]
  status: number
}

export type ClientResponseType<T = any> = SuccessResponse<T> | ErrorResponse

export type MenuItem = {
  name: string
  href: string
  Icon?: any
  roles: (AuthRole | 'PUBLIC')[]
  className?: string
}

export interface CreateCheckoutSessionRequestBody {
  username: string
  price: number
  paymentName?: string
  paymentDescription?: string
  customSubmitMessage?: string
  isDonate?: boolean
}

export const PROVIDERS_ARRAY = ['GITHUB', 'GOOGLE', 'FACEBOOK'] as const
export type ProviderName = (typeof PROVIDERS_ARRAY)[number]

export type AuthRole = 'ADMIN' | 'USER'

export type ProviderDto = {
  id: number
  profileImage?: string | null
  type: ProviderName
  userId: number
}

export type ProvidersDto = {
  id: number
  profileImage?: string | null
}

export type UnRegisteredUserCreateDto = {
  email: string
  provider: ProviderName
  profileImage?: string | null
}

export type UnRegisteredUserDto = {
  id: number
  token: string
  email: string
  providerId: number
  profileImage?: string | null
  createdAt: Date
}

export type Pageable = {
  page: number
  pageSize: number
}

export type PaginationType<T = any> = {
  page: number
  content: T[]
  pageSize: number
  totalCount: number
  totalPages: number
}

export type AuthUserUpdateDto =
  | { username: string; roles?: { id: number }[] }
  | { username?: string; roles: { id: number }[] }

export type ChannelDto = {
  id: number
  name: string
  description?: string
  createdAt: Date
}

export type NotificationCreateDto = {
  receiverIds: number[]
  senderId: number
  message: string
  link?: string
  type?: string
  additionalData?: Record<string, any>
}

export type UserChannelDto = {
  userId: number
  channelId: number
}

export type NotificationDto = {
  receiverId: number
  notificationId: number
  senderId: number
  isRead: boolean
}

export type AuthUserFullDto = AuthUserDto & {
  userChannels?: UserChannelDto[]
  sentNotifications?: NotificationDto[]
  receivedNotifications?: NotificationDto[]
}

export type EventsReponseType = 'notification' | 'announcement'

export interface EventsReponse<T = any> {
  id: string
  data: T
  time: Date
  type: EventsReponseType
}

export interface UserProfileDto {
  id: number
  createdAt: Date
  updatedAt: Date
  userId: number
  providerId: number
  profileImage?: string | null
}

export interface UserProfileCreateDto {
  userId: number
  providerId: number
  profileImage?: string | null
}

export interface AuthUserDto {
  id: number
  createdAt: Date
  username: string
  email: string
  userProfiles: {
    id: number
    providerId: number
    provider?: {
      name: string
    }
    profileImage?: string | null
  }[]
  userRole: {
    role: {
      name: string
    }
  }[]
}

export interface AuthUserCreateDto {
  username: string
  email: string
}

export type AuthRoleDTO = {
  id: number
  name: string
}

export interface SessionObject {
  cookie: {
    originalMaxAge: number
    expires: string
    secure: boolean
    httpOnly: boolean
    path: string
    sameSite: string
  }
  passport: {
    user: number // Assuming user ID is a number
  }
}

export type SocketUser = {
  userId: number
  socket: string
  pid: number
  session: string
}

export type NotificationDetailsType = {
  id: number
  isArchived?: boolean
  createdAt: Date | string
  message: string
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
}

export interface EditUserDto {
  username?: string
  profileImage?: string
}
