const redisNamespace = process.env['REDIS_NAMESPACE']
const onlineUsersList = 'online:online-users-list'
const onlineSocketUser = 'online:socket-user'

export const ONLINE_KEY_LIST = redisNamespace
  ? `${redisNamespace}:${onlineUsersList}`
  : onlineUsersList

export const SOCKET_KEY = redisNamespace
  ? `${redisNamespace}:${onlineSocketUser}`
  : onlineSocketUser

export const Events = {
  onlineUsers: 'events:online-users',
  announcements: 'events:announcements',
  refreshSession: 'events:refresh-session',
} as const

export const Rooms = {
  admin: 'admin-room',
} as const
