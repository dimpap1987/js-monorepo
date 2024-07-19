export interface UserJWT {
  id: number
  username: string
  createdAt: Date
  lastLoggedIn?: string | null
  picture?: string | null
  provider?: string | null
  roles: AuthRoles[]
}

export interface JwtPayload {
  user: UserJWT
}

export type SuccessResponse<T> = {
  ok: true
  data?: T
  message?: string
  httpStatusCode: number
}

export type ErrorResponse = {
  ok: false
  message?: string
  errors?: string[]
  httpStatusCode: number
}

export type ClientResponseType<T> = SuccessResponse<T> | ErrorResponse

export type MenuItem = {
  name: string
  href: string
  Icon?: any
  roles: ('ADMIN' | 'USER' | 'PUBLIC')[]
}

export interface CreateCheckoutSessionRequestBody {
  username: string
  price: number
  paymentName?: string
  paymentDescription?: string
  customSubmitMessage?: string
  isDonate?: boolean
}

export type ProviderName = 'github' | 'google'

export type AuthRoles = 'ADMIN' | 'USER'

export type ProviderDto = {
  id: number
  profileImage: string | null
  type: ProviderName
  userId: number
}

export type AuthUserWithProvidersDto = AuthUserDto & {
  providers: ProviderDto[]
}

export type AuthUserCreateDto = {
  email: string
  username: string
}

export type AuthUserDto = {
  id: number
  email?: string
  username: string
  roles: AuthRoles[]
  createdAt: Date
}

export type ProvidersDto = {
  type: ProviderName
  profileImage: string | null
}

export type UnRegisteredUserCreateDto = {
  email: string
  provider: ProviderName
  profileImage: string
}

export type UnRegisteredUserDto = {
  id: number
  token: string
  email: string
  provider: ProviderName
  profileImage: string | null
  createdAt: Date
}

export type RefreshTokenCreateDto = {
  userId: number
  token: string
  ipAddress?: string | null
  userAgent?: string | null
}

export type RefreshTokenDto = {
  id: number
  revoked: boolean
}

export type Pageable = {
  page: number
  pageSize: number
}

export type AuthUserUpdateDto =
  | { username: string; roles?: AuthRoles[] }
  | { username?: string; roles: AuthRoles[] }

export type ChannelDto = {
  id: number
  name: string
  description: string | null
  createdAt: Date
}

export type NotificationCreateDto = {
  receiverId: number
  senderId: number
  message: string
  link?: string
  type?: string
  additionalData?: Record<string, any> | null
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
  providers: ProviderDto[]
  userChannels: UserChannelDto[]
  sentNotifications: NotificationDto[]
  receivedNotifications: NotificationDto[]
}
